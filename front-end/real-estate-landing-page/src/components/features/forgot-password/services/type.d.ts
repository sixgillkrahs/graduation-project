namespace IForgotPasswordService {
  interface IBodyForgotPassword {
    email: string;
  }
  interface IBodyVerifyOTP {
    otp: string;
    email: string;
  }

  interface IRespVerifyOTP {
    token: string;
  }

  interface IBodyResetPassword {
    token: string;
    password: string;
    confirmPassword: string;
  }
}
