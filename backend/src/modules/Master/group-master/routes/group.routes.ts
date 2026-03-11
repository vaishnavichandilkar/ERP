/**
 * Group Master Routes
 * 
 * Note: In NestJS, routes are managed via decorators in the Controller.
 * This file serves as a reference for the module's available endpoints.
 * 
 * GET    /api/v1/group-master                - Get all groups with subgroups
 * GET    /api/v1/group-master/dropdown       - Get header groups for dropdown
 * POST   /api/v1/group-master/sub-group      - Create sub-group
 * PUT    /api/v1/group-master/sub-group/:id  - Update sub-group
 * PATCH  /api/v1/group-master/sub-group/:id/status - Toggle status
 */
export const GroupMasterRoutes = {
    root: '/group-master',
    dropdown: '/group-master/dropdown',
    subgroup: '/group-master/sub-group',
    subgroupStatus: (id: string | number) => `/group-master/sub-group/${id}/status`,
};
