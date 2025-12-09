"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { useTRPC } from "@/trpc/client";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";
import { useUser } from "@clerk/nextjs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

export const TrendingView = () => {
  const { user } = useUser();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getTrending.queryOptions());

  const { isLoadingMore, visibleCount, loaderRef } = useInfiniteScroll({
    total: data.length,
    limit: 5,
  });

  const visibleVideos = data.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-[2400px] px-4">
      <h1 className="text-3xl font-bold ">Trending</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Most popular videos at the moment
      </p>
      {data?.length === 0 ? (
        <p className="text-muted-foreground text-center pt-4`">
          There are no trending videos at the moment
        </p>
      ) : (
        <div className="flex flex-col w-[90%] gap-10 mb-10">
          {visibleVideos.map((video, index) => (
            <div key={video.id} className="flex gap-2 items-center w-full">
              <p className="text-2xl font-bold">#{index + 1}</p>
              <div className="flex-1">
                <VideoCardRow
                  data={video}
                  dropdown={
                    <GeneralVideoDropdown
                      userLoginId={user?.id}
                      videoOwnerId={video.user.clerkId}
                      videoId={video.id}
                    />
                  }
                />
              </div>
            </div>
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