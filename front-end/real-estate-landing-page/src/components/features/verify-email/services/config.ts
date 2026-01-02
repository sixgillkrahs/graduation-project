import { ParamValue } from "next/dist/server/request/params";

export const VerifyEmailEndpoint = {
  verifyEmail: (token: ParamValue) => `/agents-registrations/${token}/verify`,
  createPassword: (token: ParamValue) =>
    `/agents-registrations/${token}/create-password`,
} as const;

export const VerifyEmailQueryKey = {
  verifyEmail: "verifyEmail",
  createPassword: "createPassword",
} as const;
