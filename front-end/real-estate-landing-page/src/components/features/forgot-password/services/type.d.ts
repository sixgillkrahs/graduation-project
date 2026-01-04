namespace IForgotPasswordService {
  interface IBodyForgotPassword {
    email: string;
  }
  interface IBodyVerifyOTP {
    otp: string;
    email: string;
  }
}
