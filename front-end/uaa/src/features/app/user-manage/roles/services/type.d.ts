namespace IRoleService {
  export interface RoleDTO {
    name: string;
    permissions: PermissionDTO[];
    description: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDefault: boolean;
    id: string;
  }

  export interface CreateRoleDTO {
    name: string;
    permissions: string[];
    description: string;
    isActive: boolean;
    isDefault: boolean;
  }
}
