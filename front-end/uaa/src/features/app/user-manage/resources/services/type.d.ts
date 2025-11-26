namespace IResourceService {
  export interface SignInResponse {
    refreshToken: string;
  }

  export interface ResourceDTO {
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }
}
