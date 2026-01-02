export const SignInEndpoint = {
  signIn: () => `/auth/login`,
} as const;

export const SignInQueryKey = {
  signIn: "signIn",
} as const;
