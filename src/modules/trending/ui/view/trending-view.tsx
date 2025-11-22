"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const TrendingView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getTrending.queryOptions());
  return (
    <div className="mx-auto max-w-[2400px] px-4">
      <h1 className="text-3xl font-bold ">Trending</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Most popular videos at the moment
      </p>
      <div className="flex flex-col w-[90%] gap-10 mb-10">
        {data.map((video, index) => (
          <div key={video.id} className="flex gap-2 items-center w-full">
            <p className="text-2xl font-bold">#{index + 1}</p>
            <VideoCardRow data={video} />
          </div>
        ))}
      </div>
    </div>
  );
};
