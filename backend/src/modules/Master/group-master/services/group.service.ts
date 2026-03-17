import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GroupMasterRepository } from '../repositories/group.repository';
import { CreateGroupDto, UpdateGroupDto, UpdateGroupStatusDto } from '../dto/group-master.dto';

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
        if (targetLevel > 4) {
            throw new ForbiddenException('Maximum hierarchy level reached (Level 4)');
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
}
