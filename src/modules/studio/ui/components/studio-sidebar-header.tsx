"use client";

import { SidebarHeader } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";

export const StudioSidebarHeader = () => {
  const trpc = useTRPC();
  const { data: user } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

  return (
    <SidebarHeader className="bg-background group-data-[state=collapsed]:max-h-24">
      <div className="flex flex-col gap-4 my-5 items-center justify-center">
        <div className="relative size-32 group-data-[state=collapsed]:size-10">
          <Image
            src={user.imageUrl}
            alt="user-image"
            className="rounded-full"
            objectFit="cover"
            objectPosition="center"
            fill
          />
        </div>
        <div
          className="flex-flex-col gap-3 group-data-[state=collapsed]:opacity-0
                  group-data-[state=collapsed]:translate-y-2
                  group-data-[state=collapsed]:pointer-events-none"
        >
          <p className="text-base font-bold">Your channel</p>
          <p className="text-center">{user.name}</p>
        </div>
      </div>
    </SidebarHeader>
  );
};

export const SidebarHeaderSkeleton = () => {
  return (
    <div className="bg-background flex flex-col gap-4 justify-center items-center py-7">
      <Skeleton className="size-32 rounded-full " />
      <Skeleton className="w-20 h-5" />
      <Skeleton className="w-15 h-3" />
    </div>
  );
};
