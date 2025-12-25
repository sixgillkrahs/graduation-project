namespace ISignInService {
  export interface SignInRequest {
    username: string;
    password: string;
    rememberMe: boolean;
  }

  export interface SignInResponse {
    refreshToken: string;
  }
}
