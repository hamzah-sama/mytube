"use client";

import { VideoCardColumn } from "@/components/video-card-column";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const HomeVideoSection = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getMany.queryOptions());
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
      {data.map((video) => (
        <VideoCardColumn key={video.id} data={video}/>
      ))}
    </div>
  );
};
