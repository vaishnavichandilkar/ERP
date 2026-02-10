import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveAdminDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    adminId: string;
}
