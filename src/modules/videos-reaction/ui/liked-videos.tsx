"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const LikedVideos = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.video.getLikedVideos.queryOptions());

  return (
    <div className="mx-auto max-w-[2400px] px-4">
      <h1 className="text-3xl font-bold">Liked videos</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Your favorite videos all in one place
      </p>

      {data.length === 0 ? (
        <p className="text-muted-foreground text-center pt-4">
          You have no liked videos yet.
        </p>
      ) : (
        <div className="flex flex-col w-[90%] gap-3 mb-10">
          {data?.map((video) => (
            <VideoCardRow key={video.id} data={video} isLikePage />
          ))}
        </div>
      )}
    </div>
  );
};
