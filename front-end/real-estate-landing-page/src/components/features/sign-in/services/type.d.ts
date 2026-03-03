namespace ISignInService {
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
