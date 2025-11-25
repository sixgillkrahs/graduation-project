namespace ISignInService {
  export interface SignInRequest {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  export interface SignInResponse {
    refreshToken: string;
  }
}
