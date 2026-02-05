namespace ISignUpService {
  interface IBodySignUp {
    email: string;
    password: string;
    lastName: string;
    firstName: string;
    phone: string;
    confirmPassword: string;
    verifyPolicy: boolean;
    username?: string;
    roleCode: "USER";
  }
}
