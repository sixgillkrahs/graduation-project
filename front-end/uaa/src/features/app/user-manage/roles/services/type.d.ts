namespace IRoleService {
  export interface RoleDTO {
    name: string;
    permissionIds: PermissionDTO[];
    description: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDefault: boolean;
    id: string;
  }

  export interface CreateRoleDTO {
    name: string;
    permissionIds: string[];
    description: string;
    isActive: boolean;
    isDefault: boolean;
  }

  export interface UpdateRoleDTO {
    id: string;
    name: string;
    permissionIds: string[];
    description: string;
    isActive: boolean;
    isDefault: boolean;
  }
}
