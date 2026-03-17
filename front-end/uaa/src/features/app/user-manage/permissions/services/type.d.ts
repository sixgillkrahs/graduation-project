namespace IPermissionService {
  export interface LocalizedNameDTO {
    en: string;
    vi: string;
  }

  export interface PermissionResourceDTO {
    id: string;
    name: string | LocalizedNameDTO;
    path?: string;
  }

  export interface PermissionDTO {
    name: string | LocalizedNameDTO;
    description: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    operation: string;
    resourceId: string | PermissionResourceDTO;
    id: string;
  }

  export interface CreatePermissionDTO {
    name: LocalizedNameDTO;
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
