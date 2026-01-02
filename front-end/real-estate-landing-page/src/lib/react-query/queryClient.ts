import { showToast } from "@/components/ui/Toast";
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
    onSuccess: (
      _data: unknown,
      query: Query<unknown, unknown, unknown, QueryKey>
    ): void => {
      if (query.meta?.SUCCESS_MESSAGE) {
        showToast.success(`${query.meta.SUCCESS_MESSAGE}`);
      }
    },
    onError: (
      error: any,
      query: Query<unknown, unknown, unknown, QueryKey>
    ): void => {
      const errorSource = (query.meta?.ERROR_SOURCE as string) || "Error";
      let errorMessage = "An unknown error occurred";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showToast.error(errorSource, errorMessage);
    },
  }),
  mutationCache: new MutationCache({
    onError: (
      error: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>
    ): void => {
      const errorSource = (mutation.meta?.ERROR_SOURCE as string) || "Error";
      let errorMessage = "An unknown error occurred";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // @ts-expect-error Error type 'AxiosError' is not assignable to type 'Error'.
      if (error?.code === "ERR_BAD_REQUEST") {
        // @ts-expect-error Object is of type 'unknown'.
        errorMessage = error.response?.data?.message || errorMessage;
      }

      showToast.error(errorSource, errorMessage);
    },
    onSuccess: (
      _data: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>
    ): void => {
      if (mutation.meta?.SUCCESS_MESSAGE) {
        showToast.success(`${mutation.meta.SUCCESS_MESSAGE}`);
      }
    },
  }),
});
