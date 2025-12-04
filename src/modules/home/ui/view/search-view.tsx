"use client";

import { VideoCardRow } from "@/components/video-card-row";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { GeneralVideoDropdown } from "../components/general-video-dropdown";

interface Props {
  query: string;
}
export const SearchView = ({ query }: Props) => {
  const trpc = useTRPC();
  const {user} = useUser()

  const { data } = useSuspenseQuery(trpc.video.search.queryOptions({ query }));
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
        data.map((video) => <VideoCardRow key={video.id} data={video} 
        dropdown={<GeneralVideoDropdown userLoginId={user?.id} videoOwnerId={video.user.clerkId} videoId={video.id} />} />)
      )}
    </>
  );
};
