namespace IResourceService {
  export interface LocalizedNameDTO {
    en: string;
    vi: string;
  }

  export interface ResourceDTO {
    name: string | LocalizedNameDTO;
    path: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface CreateResourceDTO {
    name: LocalizedNameDTO;
    path: string;
    description: string;
  }

  export interface UpdateResourceDTO {
    id: string;
    name: LocalizedNameDTO;
    path: string;
    description: string;
  }
}
