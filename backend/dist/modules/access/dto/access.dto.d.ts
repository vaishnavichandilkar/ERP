import { AdministratorAccessDto, OperatorAccessDto } from '../../users/dto/create-user.dto';
export declare class UpdateUserStatusDto {
    isActive: boolean;
}
export declare class UpdateUserPermissionsDto {
    administratorAccess?: AdministratorAccessDto;
    operatorAccess?: OperatorAccessDto;
}
