export declare enum UserRole {
    ADMIN = "ADMIN",
    ADMINISTRATOR = "ADMINISTRATOR",
    OPERATOR = "OPERATOR"
}
export declare class AdministratorAccessDto {
    facilityManagement_add?: boolean;
    facilityManagement_view?: boolean;
    facilityManagement_edit?: boolean;
    facilityManagement_delete?: boolean;
    facilityManagement_export?: boolean;
    facilityManagement_print?: boolean;
    userManagement_add?: boolean;
    userManagement_view?: boolean;
    userManagement_edit?: boolean;
    userManagement_delete?: boolean;
    userManagement_export?: boolean;
    userManagement_print?: boolean;
    productManagement_add?: boolean;
    productManagement_view?: boolean;
    productManagement_edit?: boolean;
    productManagement_delete?: boolean;
    productManagement_export?: boolean;
    productManagement_print?: boolean;
    inventoryManagement_add?: boolean;
    inventoryManagement_view?: boolean;
    inventoryManagement_edit?: boolean;
    inventoryManagement_delete?: boolean;
    inventoryManagement_export?: boolean;
    inventoryManagement_print?: boolean;
    billing_add?: boolean;
    billing_view?: boolean;
    billing_edit?: boolean;
    billing_delete?: boolean;
    billing_export?: boolean;
    billing_print?: boolean;
}
export declare class OperatorAccessDto {
    facilityManagement_view?: boolean;
    productManagement_view?: boolean;
    inventoryManagement_view?: boolean;
    billing_view?: boolean;
    report_view?: boolean;
}
export declare class CreateUserDto {
    name: string;
    username: string;
    password: string;
    mobile?: string;
    role: UserRole;
    facilityId?: string;
    administratorAccess?: AdministratorAccessDto;
    operatorAccess?: OperatorAccessDto;
}
