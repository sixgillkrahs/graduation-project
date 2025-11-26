// import SignInService from "./service";
// import { type UseMutationResult, useMutation } from "@tanstack/react-query";

// export const useSignIn = (): UseMutationResult<
//   ISignInService.SignInResponse,
//   Error,
//   ISignInService.SignInRequest,
//   void
// > => {
//   return useMutation({
//     mutationFn: (data: ISignInService.SignInRequest) => {
//       const { ...rest } = data;
//       return SignInService.signIn(rest);
//     },
//     meta: {
//       ERROR_SOURCE: "[Sign in failed]",
//       SUCCESS_MESSAGE: "The user has been successfully signed in",
//     },
//   });
// };
