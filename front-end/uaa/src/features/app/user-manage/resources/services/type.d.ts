namespace IResourceService {
  export interface ResourceDTO {
    name: string;
    path: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface CreateResourceDTO {
    name: string;
    path: string;
    description: string;
  }

  export interface UpdateResourceDTO {
    id: string;
    name: string;
    path: string;
    description: string;
  }
}
