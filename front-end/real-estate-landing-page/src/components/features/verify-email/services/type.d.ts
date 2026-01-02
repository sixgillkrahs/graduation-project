namespace IVerifyEmailService {
  interface IRequest {
    token: string;
  }

  interface IResponseGetVerifyEmail {
    fullName: string;
    email: string;
    userId: string;
  }

  interface IBodyVerifyEmail {
    token: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  interface IBodyCreatePassword {
    token: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
}
