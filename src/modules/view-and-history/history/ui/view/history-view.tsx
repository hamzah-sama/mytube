"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { HistoryVideoDropdown } from "../history-video-dropdown";
import { Loader2Icon } from "lucide-react";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";

export const HistoryView = () => {
  const { user } = useUser();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getHistory.queryOptions());

  const { isLoadingMore, visibleCount, loaderRef } = useInfiniteScroll({
    total: data.length,
  });

  const visibleVideos = data.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-[2400px] px-4 ">
      <h1 className="text-3xl font-bold">History</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Videos you have watched
      </p>

      {data?.length === 0 ? (
        <p className="text-muted-foreground text-center pt-4">
          Your history is empty
        </p>
      ) : (
        <div className="flex flex-col w-[90%] gap-3 mb-10">
          {visibleVideos?.map((video) => (
            <div key={video.id} className="flex items-center gap-4">
              <p className="w-[100px]">
                {formatDistanceToNow(video.historyCreatedDate, {
                  addSuffix: true,
                })}
              </p>
              <div className="flex-1">
                <VideoCardRow
                  data={video}
                  dropdown={
                    <HistoryVideoDropdown
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