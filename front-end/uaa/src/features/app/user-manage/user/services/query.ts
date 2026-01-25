import type { Id, IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";
import { UserQueryKey } from "./config";
import UserService from "./service";

export const useGetUsers = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [UserQueryKey.getUsers, params],
    queryFn: () => UserService.GetUsers(params),
  });
};

export const useGetUser = (id: Id) => {
  return useQuery({
    queryKey: [UserQueryKey.getUser, id],
    queryFn: () => UserService.GetUserById(id),
    enabled: !!id,
    refetchOnMount: "always",
  });
};