export declare class OperatorPermissionsDto {
    facilityManagement_view?: boolean;
    productManagement_view?: boolean;
    inventoryManagement_view?: boolean;
    billing_view?: boolean;
    report_view?: boolean;
}
export declare class CreateOperatorDto {
    name: string;
    username: string;
    password: string;
    mobile?: string;
    facilityId: string;
    permissions?: OperatorPermissionsDto;
}
