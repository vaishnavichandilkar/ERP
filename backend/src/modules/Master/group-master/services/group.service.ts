import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupMasterRepository } from '../repositories/group.repository';
import { CreateSubGroupDto, UpdateSubGroupDto, UpdateSubGroupStatusDto, UpdateGroupStatusDto } from '../dto/group-master.dto';

@Injectable()
export class GroupMasterService {
    constructor(private readonly groupRepository: GroupMasterRepository) { }

    async getAllGroupsWithSubGroups(userId: number) {
        const data = await this.groupRepository.findAllWithSubGroups(userId);
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

    async createSubGroup(dto: CreateSubGroupDto, userId: number) {
        const group_id = dto.group_id;
        const sub_group_name = dto.sub_group_name.trim();

        // Check if header group exists
        const group = await this.groupRepository.findGroupById(group_id);
        if (!group) {
            throw new NotFoundException(`Header group with ID ${group_id} not found`);
        }

        // Check for duplicate sub-group name under the same group for this specific user
        const existing = await this.groupRepository.findSubGroupByNameAndGroup(sub_group_name, group_id, userId);
        if (existing) {
            throw new ConflictException(`Sub-group "${sub_group_name}" already exists under this group`);
        }

        const data = await this.groupRepository.createSubGroup({
            sub_group_name,
            group_id,
            userId,
        });

        return {
            success: true,
            message: 'Sub-group created successfully',
            data,
        };
    }

    async updateSubGroup(id: number, dto: UpdateSubGroupDto, userId: number) {
        const group_id = dto.group_id;
        const sub_group_name = dto.sub_group_name.trim();

        // Check if sub-group exists and belongs to the user
        const subGroup = await this.groupRepository.findSubGroupById(id, userId);
        if (!subGroup) {
            throw new NotFoundException(`Sub-group with ID ${id} not found or access denied`);
        }

        // Check if header group exists
        const group = await this.groupRepository.findGroupById(group_id);
        if (!group) {
            throw new NotFoundException(`Header group with ID ${group_id} not found`);
        }

        // Check for duplicate sub-group name under the same group (excluding current id)
        const existing = await this.groupRepository.findSubGroupByNameAndGroup(sub_group_name, group_id, userId);
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

    async updateGroupStatus(id: number, dto: UpdateGroupStatusDto) {
        const group = await this.groupRepository.findGroupById(id);
        if (!group) {
            throw new NotFoundException(`Header group with ID ${id} not found`);
        }

        const data = await this.groupRepository.updateGroupStatus(id, dto.status);

        return {
            success: true,
            message: `Group status changed to ${dto.status}`,
            data,
        };
    }

    async updateSubGroupStatus(id: number, dto: UpdateSubGroupStatusDto, userId: number) {
        console.log(`Updating sub-group status: ID=${id}, Status=${dto.status}, UserID=${userId}`);
        const subGroup = await this.groupRepository.findSubGroupById(id, userId);
        
        if (!subGroup) {
            console.warn(`Sub-group not found or access denied for ID=${id}, UserID=${userId}`);
            throw new NotFoundException(`Sub-group with ID ${id} not found or access denied`);
        }

        console.log(`Found sub-group: ${JSON.stringify(subGroup)}`);
        const data = await this.groupRepository.updateSubGroupStatus(id, dto.status);
        console.log(`Update successful, new data: ${JSON.stringify(data)}`);

        return {
            success: true,
            message: `Sub-group status changed to ${dto.status}`,
            data,
        };
    }
}
