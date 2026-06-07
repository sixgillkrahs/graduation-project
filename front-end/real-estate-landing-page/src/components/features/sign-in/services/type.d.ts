namespace ISignInService {
  interface ISignInResponse {
    user: {
      id: string;
      email: string;
      name: string;
    };
    role: {
      id: string;
      name: string;
      code: string;
    };
  }

  interface IBodySignIn {
    username: string;
    password: string;
    rememberMe?: boolean;
  }

  interface IBodySignInPasskey {}

  interface IBodyVerifySignInPasskey {
    response: any;
  }
}
