"use client";

import { VideoCardColumn } from "@/components/video-card-column";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useSuspenseQuery } from "@tanstack/react-query";

export const SubscriptionsView = () => {
  const { user } = useUser();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.subscription.getVideos.queryOptions()
  );

  return (
    <div className="flex flex-col mx-auto max-w-[2400px] px-4 gap-4 ">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Videos from your favorite creator
      </p>

      {data?.length === 0 ? (
        <p className="text-muted-foreground text-center pt-4`">
          You have no subscriptions yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
          {data?.map((video) => (
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
