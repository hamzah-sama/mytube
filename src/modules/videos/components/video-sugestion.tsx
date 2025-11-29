"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { VideoCard } from "./video-card";

interface Props {
  videoPlaybackId: string;
}
export const SugestionSection = ({ videoPlaybackId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.video.getSuggestions.queryOptions({ videoPlaybackId })
  );
  return (
    <div className="flex lg:flex-col gap-5 overflow-x-auto min-w-[400px]">
      {data.length === 0 && <p className="text-muted-foreground text-center">No videos suggestions</p>}
      {data.map((video) => (
        <VideoCard key={video.id} data={video} />
      ))}
    </div>
  );
};
