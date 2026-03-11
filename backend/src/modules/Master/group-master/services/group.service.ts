import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupMasterRepository } from '../repositories/group.repository';
import { CreateSubGroupDto, UpdateSubGroupDto, UpdateSubGroupStatusDto } from '../dto/group-master.dto';

@Injectable()
export class GroupMasterService {
    constructor(private readonly groupRepository: GroupMasterRepository) { }

    async getAllGroupsWithSubGroups() {
        const data = await this.groupRepository.findAllWithSubGroups();
        return {
            success: true,
            message: 'Groups retrieved successfully',
            data,
        };
    }

    async getHeaderGroupsForDropdown() {
        const data = await this.groupRepository.findHeaderGroupsForDropdown();
        return {
            success: true,
            message: 'Header groups retrieved successfully',
            data,
        };
    }

    async createSubGroup(dto: CreateSubGroupDto) {
        const group_id = dto.group_id;
        const sub_group_name = dto.sub_group_name.trim();

        // Check if header group exists
        const group = await this.groupRepository.findGroupById(group_id);
        if (!group) {
            throw new NotFoundException(`Header group with ID ${group_id} not found`);
        }

        // Check for duplicate sub-group name under the same group
        const existing = await this.groupRepository.findSubGroupByNameAndGroup(sub_group_name, group_id);
        if (existing) {
            throw new ConflictException(`Sub-group "${sub_group_name}" already exists under this group`);
        }

        const data = await this.groupRepository.createSubGroup({
            sub_group_name,
            group_id,
        });

        return {
            success: true,
            message: 'Sub-group created successfully',
            data,
        };
    }

    async updateSubGroup(id: number, dto: UpdateSubGroupDto) {
        const group_id = dto.group_id;
        const sub_group_name = dto.sub_group_name.trim();

        // Check if sub-group exists
        const subGroup = await this.groupRepository.findSubGroupById(id);
        if (!subGroup) {
            throw new NotFoundException(`Sub-group with ID ${id} not found`);
        }

        // Check if header group exists
        const group = await this.groupRepository.findGroupById(group_id);
        if (!group) {
            throw new NotFoundException(`Header group with ID ${group_id} not found`);
        }

        // Check for duplicate sub-group name under the same group (excluding current id)
        const existing = await this.groupRepository.findSubGroupByNameAndGroup(sub_group_name, group_id);
        if (existing && existing.id !== id) {
            throw new ConflictException(`Sub-group "${sub_group_name}" already exists under this group`);
        }

        const data = await this.groupRepository.updateSubGroup(id, {
            sub_group_name,
            group_id,
        });

        return {
            success: true,
            message: 'Sub-group updated successfully',
            data,
        };
    }

    async updateSubGroupStatus(id: number, dto: UpdateSubGroupStatusDto) {
        const subGroup = await this.groupRepository.findSubGroupById(id);
        if (!subGroup) {
            throw new NotFoundException(`Sub-group with ID ${id} not found`);
        }

        const data = await this.groupRepository.updateSubGroupStatus(id, dto.status);

        return {
            success: true,
            message: `Sub-group status changed to ${dto.status ? 'Active' : 'Inactive'}`,
            data,
        };
    }
}
