import { ParamValue } from "next/dist/server/request/params";

export const VerifyEmailEndpoint = {
  verifyEmail: (token: ParamValue) => `/agents-registrations/${token}`,
} as const;

export const VerifyEmailQueryKey = {
  verifyEmail: "verifyEmail",
} as const;
