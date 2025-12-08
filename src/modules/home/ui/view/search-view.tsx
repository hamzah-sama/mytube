"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { GeneralVideoDropdown } from "../components/general-video-dropdown";
import { useInfiniteScroll } from "@/lib/use-infinte-scroll";
import { Loader2Icon } from "lucide-react";

interface Props {
  query: string;
}
export const SearchView = ({ query }: Props) => {
  const trpc = useTRPC();
  const { user } = useUser();

  const { data } = useSuspenseQuery(trpc.video.search.queryOptions({ query }));
  const { isLoadingMore, visibleCount, loaderRef } = useInfiniteScroll({
    total: data.length,
    limit: 5,
  });

  const visibleVideos = data.slice(0, visibleCount);
  return (
    <>
      <h1 className="text-lg font-bold text-left">
        Search results for "{query}"
      </h1>
      {data?.length === 0 ? (
        <p className="flex justify-center pt-5 text-muted-foreground">
          No videos found
        </p>
      ) : (
        visibleVideos.map((video) => (
          <VideoCardRow
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
        ))
      )}
      {isLoadingMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  );
};
