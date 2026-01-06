import { ParamValue } from "next/dist/server/request/params";

export const EditProfileEndpoint = {
  editProfile: () => `/users/profile`,
} as const;

export const EditProfileQueryKey = {
  editProfile: "editProfile",
} as const;
