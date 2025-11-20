import { Button } from "@/components/ui/button";
import { videoDetailsType } from "@/type";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Props {
  video: videoDetailsType;
}
export const SubscribeButton = ({ video }: Props) => {
  const { openSignIn, user } = useClerk();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { userId: clerkUserId } = useAuth();

  const createSubscriber = useMutation(
    trpc.subscriberCount.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.video.getOne.queryOptions({
            videoPlaybackId: video.muxPlaybackId!,
          })
        );

        queryClient.invalidateQueries(
          trpc.subscriberCount.isSubscribed.queryOptions({
            videoId: video.id,
          })
        );
      },
      onError: (err) => {
        toast.error(err.message);
        if (err.data?.code === "UNAUTHORIZED") {
          openSignIn();
        }
      },
    })
  );
  const handleSubscribe = () => {
    if(!user) return openSignIn();
    setSubscribe((prev) => !prev);
    createSubscriber.mutate({ videoId: video.id });
  };

  const { data: isSubscribed } = useQuery({
    ...trpc.subscriberCount.isSubscribed.queryOptions({ videoId: video.id }),
    enabled: !!clerkUserId,
  });

  const [subscibe, setSubscribe] = useState(isSubscribed ?? false);

  useEffect(() => {
    if (isSubscribed !== undefined) {
      setSubscribe(isSubscribed);
    }
  }, [isSubscribed]);

  return (
    <>
      {video.user.clerkId === clerkUserId ? (
        <Button asChild variant="secondary" className="rounded-full">
          <Link href={`/studio/video/${video.id}`}>
            <span className="text-base font-medium">Edit video</span>
          </Link>
        </Button>
      ) : (
        <Button
          onClick={handleSubscribe}
          className="rounded-full disabled:cursor-not-allowed"
          disabled={createSubscriber.isPending}
        >
          <span className="text-base font-medium">
            {subscibe ? "Unsubscribe" : "Subscribed"}
          </span>
        </Button>
      )}
    </>
  );
};
