"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export const HistoryView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getHistory.queryOptions());
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
          {data?.map((video) => (
            <div key={video.id} className="flex items-center gap-4">
              <p>{formatDistanceToNow(video.historyCreatedDate, { addSuffix: true })}</p>
              <VideoCardRow data={video} isHistoryPage />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
