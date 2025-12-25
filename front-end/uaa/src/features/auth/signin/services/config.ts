import type { ServiceEndpoint } from "@shared/types/service";

export const SignInEndpoint: ServiceEndpoint = {
  SignIn: () => "/auth/login",
} as const;
