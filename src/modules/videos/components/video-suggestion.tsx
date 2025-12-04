"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { VideoCard } from "./video-card";
import { useUser } from "@clerk/nextjs";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";

interface Props {
  videoPlaybackId: string;
}
export const SugestionSection = ({ videoPlaybackId }: Props) => {
  const { user } = useUser();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.video.getSuggestions.queryOptions({ videoPlaybackId })
  );
  return (
    <div className="flex lg:flex-col gap-5 overflow-x-auto min-w-[400px]">
      {data.length === 0 && (
        <p className="text-muted-foreground text-center">
          No video suggestions yet
        </p>
      )}
      {data.map((video) => (
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
    </div>
  );
};
