"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { VideoCardColumn } from "@/components/video-card-column";
import { VideoColumnSkeleton } from "@/modules/videos/components/skeleton/video-skeleton";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GeneralVideoDropdown } from "./general-video-dropdown";

export const HomeVideosSection = () => {
  const [value, setValue] = useState<string | null>(null);
  const { user } = useUser();
  const trpc = useTRPC();
  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const data = categories.map(({ name, id }) => ({ name, id }));

  const { data: videos, isLoading: isLoadingVideos } = useQuery(
    trpc.video.getMany.queryOptions({ categoryId: value ?? undefined })
  );

  return (
    <div className="flex flex-col mx-auto max-w-[2400px] px-4 gap-4">
      <FilterCarousel
        data={data}
        onSelect={(x) => {
          setValue(x);
        }}
        value={value}
      />
      {isLoadingVideos ? (
        <VideoColumnSkeleton />
      ) : videos?.length === 0 ? (
        <p className="flex justify-center pt-5 text-muted-foreground">
          No videos found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
          {videos?.map((video) => (
            <VideoCardColumn
              key={video.id}
              data={video}
              dropdown={
                <GeneralVideoDropdown
                  userLoginId={user?.id}
                  videoOwnerId={video.user.clerkId}
                  videoId={video.id}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
