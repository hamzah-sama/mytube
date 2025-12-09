"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LikeVideoDropdown } from "./like-video-dropdown";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";

export const LikedVideos = () => {
  const { user } = useUser();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getLikedVideos.queryOptions());

  const { isLoadingMore, visibleCount, loaderRef } = useInfiniteScroll({
    total: data.length,
  });

  const visibleVideos = data.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-[2400px] px-4">
      <h1 className="text-3xl font-bold">Liked videos</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Your favorite videos all in one place
      </p>

      {data?.length === 0 ? (
        <p className="text-muted-foreground text-center pt-4">
          You have no liked videos yet.
        </p>
      ) : (
        <div className="flex flex-col w-[90%] gap-3 mb-10">
          {visibleVideos?.map((video) => (
            <VideoCardRow
              key={video.id}
              data={video}
              dropdown={
                <LikeVideoDropdown
                  videoId={video.id}
                  userLoginId={user?.id}
                  videoOwnerId={video.user.clerkId}
                />
              }
            />
          ))}
        </div>
      )}
      {isLoadingMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};