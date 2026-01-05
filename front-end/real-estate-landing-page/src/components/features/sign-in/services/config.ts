export const SignInEndpoint = {
  signIn: () => `/auth/login`,
  signInPasskey: () => `/auth/login-passkey`,
} as const;

export const SignInQueryKey = {
  signIn: "signIn",
  signInPasskey: "signInPasskey",
} as const;
