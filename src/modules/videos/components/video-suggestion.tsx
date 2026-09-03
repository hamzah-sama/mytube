"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { VideoCard } from "./video-card";
import { useUser } from "@clerk/nextjs";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";
import { Loader2Icon } from "lucide-react";

interface Props {
  videoPlaybackId: string;
}
export const SugestionSection = ({ videoPlaybackId }: Props) => {
  const { user } = useUser();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.video.getSuggestions.queryOptions({ videoPlaybackId })
  );

  const { isLoadingMore, visibleCount, loaderRef } = useInfiniteScroll({
    total: data.length,
    limit: 5,
  });

  const visibleVideos = data.slice(0, visibleCount);
  return (
    <div className="flex lg:flex-col gap-5 overflow-x-auto min-w-[400px]">
      {data.length === 0 && (
        <p className="text-muted-foreground text-center">
          No video suggestions yet
        </p>
      )}
      {visibleVideos.map((video) => (
        <VideoCard
          key={video.id}
          data={video}
          dropdown={
            <GeneralVideoDropdown
              userLoginId={user?.id}
              videoId={video.id}
              videoOwnerId={video.user.clerkId}
            />
          }
        />
      ))}
      {isLoadingMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
