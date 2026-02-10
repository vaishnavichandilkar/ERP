export declare class AdministratorPermissionsDto {
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
export declare class CreateAdministratorDto {
    name: string;
    username: string;
    password: string;
    mobile?: string;
    facilityId: string;
    permissions?: AdministratorPermissionsDto;
}
