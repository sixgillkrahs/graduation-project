import MessageService from "./message";
import {
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000 * 3,
    },
  },
  queryCache: new QueryCache({
    onSuccess: (_data: unknown, query: Query<unknown, unknown, unknown, QueryKey>): void => {
      if (query.meta?.SUCCESS_MESSAGE) {
        // toast.success(`${query.meta.SUCCESS_MESSAGE}:`);
        console.log(`${query.meta.SUCCESS_MESSAGE}:`);
      }
    },
    onError: (error: any, query: Query<unknown, unknown, unknown, QueryKey>): void => {
      if (axios.isAxiosError(error) && query.meta?.ERROR_SOURCE) {
        // toast.error(`${query.meta.ERROR_SOURCE}: ${error.response?.data?.message}`);
        console.error(`${query.meta.ERROR_SOURCE}: ${error.response?.data?.message}`);
      }
      if (error instanceof Error && query.meta?.ERROR_SOURCE) {
        // toast.error(`${query.meta.ERROR_SOURCE}: ${error.message}`);
        console.error(`${query.meta.ERROR_SOURCE}: ${error.message}`);
      }
      if (error?.response && error.response.status === 404) {
        MessageService.error(`${error?.response?.data?.message}`);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (
      error: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>,
    ): void => {
      if (axios.isAxiosError(error) && mutation.meta?.ERROR_SOURCE) {
        MessageService.error(`${mutation.meta.ERROR_SOURCE}: ${error.response?.data?.message}`);
      }
      if (error instanceof Error && mutation.meta?.ERROR_SOURCE) {
        MessageService.error(`${mutation.meta.ERROR_SOURCE}: ${error.message}`);
      }
      //@ts-expect-error  Error type 'AxiosError' is not assignable to type 'Error'.
      if (error.code === "ERR_BAD_REQUEST" && mutation.meta?.ERROR_SOURCE) {
        //@ts-expect-error  Object is of type 'unknown'.
        MessageService.error(`${mutation.meta.ERROR_SOURCE}: ${error.response.data.message}`);
      }
    },
    onSuccess: (
      _data: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>,
    ): void => {
      if (mutation.meta?.SUCCESS_MESSAGE) {
        MessageService.success(`${mutation.meta.SUCCESS_MESSAGE}`);
      }
    },
  }),
});
