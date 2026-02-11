import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Users (Onboarding & Management)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post('create')
    @ApiOperation({ summary: 'Create a new sub-user (ADMINISTRATOR / OPERATOR)' })
    @ApiResponse({ status: 201, description: 'User created successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Requires userManagement_add permission.' })
    @ApiResponse({ status: 409, description: 'Username already exists.' })
    @RequirePermission('userManagement_add')
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }


}
