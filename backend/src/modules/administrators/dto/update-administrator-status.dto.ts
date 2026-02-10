import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdministratorStatusDto {
    @ApiProperty()
    @IsBoolean()
    isActive: boolean;
}
