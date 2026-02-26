import { toast } from "sonner";
import {
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import axios from "axios";
import { getClientTranslation } from "@/lib/i18n/getClientTranslation";

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
      query: Query<unknown, unknown, unknown, QueryKey>,
    ): void => {
      if (query.meta?.SUCCESS_MESSAGE) {
        const msg = getClientTranslation(query.meta.SUCCESS_MESSAGE as string);
        toast.success(msg, {
          position: "top-center",
        });
      }
    },
    onError: (
      error: any,
      query: Query<unknown, unknown, unknown, QueryKey>,
    ): void => {
      if (query.meta?.SUPPRESS_ERROR) return;

      const errorSource = getClientTranslation(
        (query.meta?.ERROR_SOURCE as string) || "notifications.error",
      );
      let errorMessage = getClientTranslation("notifications.unknownError");

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(`${errorSource}: ${errorMessage}`, {
        position: "top-center",
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (
      error: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>,
    ): void => {
      const errorSource = getClientTranslation(
        (mutation.meta?.ERROR_SOURCE as string) || "notifications.error",
      );
      let errorMessage = getClientTranslation("notifications.unknownError");

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

      toast.error(`${errorSource}: ${errorMessage}`, {
        position: "top-center",
      });
    },
    onSuccess: (
      _data: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>,
    ): void => {
      if (mutation.meta?.SUCCESS_MESSAGE) {
        const msg = getClientTranslation(
          mutation.meta.SUCCESS_MESSAGE as string,
        );
        toast.success(msg, {
          position: "top-center",
        });
      }
    },
  }),
});
