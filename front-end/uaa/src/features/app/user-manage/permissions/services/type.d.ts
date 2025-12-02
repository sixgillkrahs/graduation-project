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
    operation: string;
    resourceId: string;
    isActive: boolean;
  }

  export interface UpdatePermissionDTO extends CreatePermissionDTO {
    id: string;
  }

  export interface UpdatePermissionStatusDTO {
    id: string;
    isActive: boolean;
  }

  export interface IOperation {
    value: string;
    label: string;
    color: `#${string}`;
  }
}
