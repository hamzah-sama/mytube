"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const StudioView = () => {
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(trpc.auth.getUser.queryOptions());
  return <div className="flex flex-col mx-auto max-w-[2400px] px-4"></div>;
};
