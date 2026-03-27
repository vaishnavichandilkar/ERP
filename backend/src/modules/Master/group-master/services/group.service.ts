import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GroupMasterRepository } from '../repositories/group.repository';
import { CreateGroupDto, UpdateGroupDto, UpdateGroupStatusDto } from '../dto/group-master.dto';
import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class GroupMasterService {
    constructor(private readonly groupRepository: GroupMasterRepository) { }

    async getAllGroups(userId: number) {
        const tree = await this.groupRepository.findAllGroups(userId);

        return {
            success: true,
            message: 'Groups retrieved successfully',
            data: tree,
        };
    }

    async getDropdownGroups(userId: number) {
        const data = await this.groupRepository.getDropdownGroups(userId);
        return {
            success: true,
            message: 'Dropdown groups retrieved successfully',
            data,
        };
    }

    async createGroup(dto: CreateGroupDto, userId: number) {
        // Parent ID might be a virtual ID string (level_id) or a legacy number
        const parent_uid = typeof dto.parent_id === 'string' ? dto.parent_id : String(dto.parent_id);
        const group_name = dto.group_name.trim();

        // 1. Identify parent level to determine target table
        const parentInfo = await this.groupRepository.findGroupLevel(parent_uid, userId);
        if (!parentInfo) {
            throw new NotFoundException(`Parent group with ID ${parent_uid} not found`);
        }

        const parent_raw_id = parentInfo.data.id;
        const targetLevel = parentInfo.level + 1;
        if (targetLevel > 5) {
            throw new ForbiddenException('Maximum hierarchy level reached (Level 4 sub-groups)');
        }

        // 2. Check for duplicates in the target level/table
        const existing = await this.groupRepository.findGroupByNameAndParent(group_name, targetLevel, parent_raw_id, userId);
        if (existing) {
            throw new ConflictException(`Group "${group_name}" already exists under this parent`);
        }

        // 3. Save to the correct table based on target level
        let data;
        switch (targetLevel) {
            case 2:
                data = await this.groupRepository.createSubGroup({ subgroup_name: group_name, group_id: parent_raw_id, userId });
                break;
            case 3:
                data = await this.groupRepository.createSubSubGroup({ name: group_name, sub_group_id: parent_raw_id, userId });
                break;
            case 4:
                data = await this.groupRepository.createSubSubSubGroup({ name: group_name, sub_sub_group_id: parent_raw_id, userId });
                break;
            case 5:
                data = await this.groupRepository.createSubSubSubSubGroup({ name: group_name, sub_sub_sub_group_id: parent_raw_id, userId });
                break;
            default:
                throw new ForbiddenException('Invalid hierarchy level');
        }

        return {
            success: true,
            message: 'Group created successfully',
            data: { ...data, level: targetLevel },
        };
    }

    async updateGroup(id: string, dto: UpdateGroupDto, userId: number) {
        const parent_uid = typeof dto.parent_id === 'string' ? dto.parent_id : String(dto.parent_id);
        const group_name = dto.group_name.trim();

        // 1. Identify current level and group existence
        const info = await this.groupRepository.findGroupLevel(id, userId);
        if (!info) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }

        const level = info.level;
        const raw_id = info.data.id;

        if (level === 1) {
            if ((info.data as any)?.is_header) {
                throw new ForbiddenException('Header groups cannot be edited');
            }
        }

        // 2. Check if parent group exists and user has access
        const parentInfo = await this.groupRepository.findGroupLevel(parent_uid, userId);
        if (!parentInfo) {
            throw new NotFoundException(`Parent group with ID ${parent_uid} not found`);
        }

        const parent_raw_id = parentInfo.data.id;

        // 3. Ensure moving consistent with table levels
        if (parentInfo.level !== level - 1) {
            throw new ForbiddenException(`This group is at Level ${level} and must have a Level ${level - 1} parent`);
        }

        // 4. Check for duplicate group name under same parent
        const existing = await this.groupRepository.findGroupByNameAndParent(group_name, level, parent_raw_id, userId);
        if (existing && existing.id !== raw_id) {
            throw new ConflictException(`Group "${group_name}" already exists under this parent`);
        }

        const data = await this.groupRepository.updateGroupName(raw_id, level, {
            group_name,
            parent_id: parent_raw_id,
        }, userId);

        return {
            success: true,
            message: 'Group updated successfully',
            data,
        };
    }

    async updateStatus(id: string, dto: UpdateGroupStatusDto, userId: number) {
        // We need to find which level it belongs to first
        const info = await this.groupRepository.findGroupLevel(id, userId);

        if (!info) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }

        const data = await this.groupRepository.updateGroupStatus(info.data.id, info.level, dto.status, userId);
        if (!data) {
            throw new ForbiddenException('Cannot update status for this group (it may be a header group)');
        }

        return {
            success: true,
            message: `Group status changed to ${dto.status}`,
            data,
        };
    }

    async importGroups(buffer: Buffer, userId: number) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            throw new BadRequestException('Invalid Excel file format');
        }

        const rowCount = worksheet.rowCount;
        if (rowCount < 2) {
            throw new BadRequestException('No data found to import');
        }

        let importedRows = 0;
        let failed = 0;
        const errors: string[] = [];

        let headerRowIndex = -1;
        const colMap: Record<string, number> = {};

        for (let r = 1; r <= Math.min(rowCount, 10); r++) {
            const row = worksheet.getRow(r);
            let foundHeaders = false;
            row.eachCell((cell, colNumber) => {
                const val = String(cell.value || '').trim().toLowerCase();
                if (val === 'level') colMap['level'] = colNumber;
                if (val === 'group name') { colMap['groupName'] = colNumber; foundHeaders = true; }
                if (val === 'under') colMap['under'] = colNumber;
                if (val === 'status') colMap['status'] = colNumber;
            });

            if (foundHeaders) {
                headerRowIndex = r;
                break;
            }
        }

        if (headerRowIndex === -1) {
            throw new BadRequestException('Could not find Group Name column in the provided Excel file.');
        }

        const getVal = (row: ExcelJS.Row, key: string, defaultVal: any = '') => {
            const colIdx = colMap[key];
            if (!colIdx) return defaultVal;
            return row.getCell(colIdx).value;
        };
        
        // Track the virtual ID for each level
        const lastIds: Record<number, string> = {};

        // We need prisma instance to query level 1 directly
        const prisma = (this.groupRepository as any).prisma;

        for (let i = headerRowIndex + 1; i <= rowCount; i++) {
            const row = worksheet.getRow(i);
            const levelValue = getVal(row, 'level', null);
            const level = levelValue !== null && levelValue !== undefined ? Number(levelValue) : null;
            const groupName = String(getVal(row, 'groupName')).trim();

            if (level === null || isNaN(level as number) || !groupName || groupName === '-') continue; // empty or header row

            try {
                if (level === 0) {
                    const existing1 = await prisma.group.findFirst({
                        where: { group_name: groupName, OR: [{ userId: null, is_header: true }, { userId }] }
                    });
                    if (existing1) {
                         lastIds[0] = `1_${existing1.id}`;
                    } else {
                         const newG = await this.groupRepository.createPrimaryGroup({ group_name: groupName, userId });
                         lastIds[0] = `1_${newG.id}`;
                         importedRows++;
                    }
                } else {
                    const parentUid = lastIds[level - 1];
                    if (!parentUid) {
                        throw new BadRequestException(`No parent group found at level ${level - 1}`);
                    }
                    const parentInfo = await this.groupRepository.findGroupLevel(parentUid, userId);
                    if (!parentInfo) {
                        throw new NotFoundException(`Parent group ${parentUid} not found`);
                    }
                    const parent_raw_id = parentInfo.data.id;
                    const targetLevel = parentInfo.level + 1;
                    
                    if (targetLevel > 5) {
                        throw new ForbiddenException('Maximum hierarchy level reached');
                    }
                    
                    let existing = await this.groupRepository.findGroupByNameAndParent(groupName, targetLevel, parent_raw_id, userId);
                    if (existing) {
                        lastIds[level] = `${targetLevel}_${existing.id}`;
                    } else {
                         let data;
                         switch (targetLevel) {
                             case 2:
                                 data = await this.groupRepository.createSubGroup({ subgroup_name: groupName, group_id: parent_raw_id, userId });
                                 break;
                             case 3:
                                 data = await this.groupRepository.createSubSubGroup({ name: groupName, sub_group_id: parent_raw_id, userId });
                                 break;
                             case 4:
                                 data = await this.groupRepository.createSubSubSubGroup({ name: groupName, sub_sub_group_id: parent_raw_id, userId });
                                 break;
                             case 5:
                                 data = await this.groupRepository.createSubSubSubSubGroup({ name: groupName, sub_sub_sub_group_id: parent_raw_id, userId });
                                 break;
                         }
                         lastIds[level] = `${targetLevel}_${data.id}`;
                         importedRows++;
                    }
                }
            } catch (error) {
                failed++;
                errors.push(`Row ${i} (${groupName}): ${error.message}`);
            }
        }

        if (importedRows === 0 && failed > 0) {
            throw new BadRequestException(`Import failed: ${errors[0]}`);
        }

        if (importedRows === 0 && failed === 0) {
            throw new BadRequestException('No data found to import');
        }

        return {
            success: true,
            message: `Imported ${importedRows} groups. ${failed > 0 ? failed + ' rows failed.' : ''}`,
            errors: failed > 0 ? errors : undefined,
        };
    }
}
