import type { ServiceEndpoint } from "@shared/types/service";

export const SignInEndpoint: ServiceEndpoint = {
  SignIn: () => "/sign-in",
} as const;
