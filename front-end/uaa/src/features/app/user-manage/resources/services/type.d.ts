namespace IResourceService {
  export interface ResourceDTO {
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface CreateResourceDTO {
    name: string;
    description: string;
  }

  export interface UpdateResourceDTO {
    id: string;
    name: string;
    description: string;
  }
}
