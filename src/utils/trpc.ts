import { createTRPCQueryUtils } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";
import { AppRouter } from "@/trpc/routers/_app";

export const getTrpcQueryUtils = () => {
  const queryClient = new QueryClient();

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${
          process.env.NEXT_PUBLIC_TRPC_URL ?? "http://localhost:3000"
        }/api/trpc`,
        transformer: superjson, // ✅ pindah ke sini (perubahan dari v11)
      }),
    ],
  });

  const utils = createTRPCQueryUtils({
    queryClient,
    client,
  });

  return { utils, queryClient };
};
