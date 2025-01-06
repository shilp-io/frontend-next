import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
