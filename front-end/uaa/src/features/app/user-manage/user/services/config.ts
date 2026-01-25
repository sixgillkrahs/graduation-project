import type { Id } from "@shared/types/service";

export const UserEndpoint = {
  GetUsers: () => "/users",
  GetUser: (id: Id) => `/users/${id}`,
} as const;

export const UserQueryKey = {
  getUsers: "getUsers",
  getUser: "getUser",
} as const;
