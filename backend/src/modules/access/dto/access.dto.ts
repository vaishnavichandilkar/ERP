import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AdministratorAccessDto, OperatorAccessDto } from '../../users/dto/create-user.dto';

export class UpdateUserStatusDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    isActive: boolean;
}

export class UpdateUserPermissionsDto {
    @ApiProperty({ type: AdministratorAccessDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AdministratorAccessDto)
    administratorAccess?: AdministratorAccessDto;

    @ApiProperty({ type: OperatorAccessDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => OperatorAccessDto)
    operatorAccess?: OperatorAccessDto;
}

