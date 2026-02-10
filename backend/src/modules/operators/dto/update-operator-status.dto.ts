import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOperatorStatusDto {
    @ApiProperty()
    @IsBoolean()
    isActive: boolean;
}
