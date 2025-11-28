namespace IPermissionService {
  export interface PermissionDTO {
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    operation: string;
    resourceId: string;
    id: string;
  }

  export interface CreatePermissionDTO {
    name: string;
    description: string;
  }

  export interface UpdatePermissionDTO {
    id: string;
    name: string;
    description: string;
  }
}
