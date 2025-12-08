import { Button } from "@/components/ui/button";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { videoDetailsType } from "@/type";

interface SubscribeButtonProps {
  userId?: string;
  videoId?: string;
  videoPlaybackId?: string | null;
  isOwner: boolean;
  ownerLink: string;
  ownerText: string;
}

export const SubscribeButton = ({
  userId,
  videoId,
  videoPlaybackId,
  isOwner,
  ownerLink,
  ownerText,
}: SubscribeButtonProps) => {
  const { openSignIn } = useClerk();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { userId: clerkUserId, isSignedIn } = useAuth();

  const createSubscriber = useMutation(
    trpc.subscription.create.mutationOptions({
      onSuccess: () => {
        if (userId) {
          queryClient.invalidateQueries(
            trpc.user.getOne.queryOptions({ userId })
          );
          queryClient.invalidateQueries(
            trpc.subscription.isSubscribed.queryOptions({ userId })
          );
          queryClient.invalidateQueries(
            trpc.subscription.getCreators.queryOptions()
          );
        }
        if (videoId) {
          queryClient.invalidateQueries(
            trpc.video.getOne.queryOptions({
              videoPlaybackId: videoPlaybackId!,
            })
          );
          queryClient.invalidateQueries(
            trpc.subscription.isSubscribed.queryOptions({ videoId })
          );
          queryClient.invalidateQueries(
            trpc.subscription.getCreators.queryOptions()
          );
        }
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
    if (!isSignedIn) return openSignIn();
    setSubscribed((p) => !p);

    if (userId) createSubscriber.mutate({ userId });
    if (videoId) createSubscriber.mutate({ videoId });
  };

  // === query: check isSubscribed ===
  const { data: isSubscribed } = useQuery({
    ...(userId
      ? trpc.subscription.isSubscribed.queryOptions({ userId })
      : trpc.subscription.isSubscribed.queryOptions({ videoId })),
    enabled: !!clerkUserId,
  });

  const [subscribed, setSubscribed] = useState(isSubscribed ?? false);

  useEffect(() => {
    if (isSubscribed !== undefined) {
      setSubscribed(isSubscribed);
    }
  }, [isSubscribed]);

  // === UI ===
  if (isOwner) {
    return (
      <Button asChild variant="secondary" className="rounded-full w-fit">
        <Link href={ownerLink}>
          <span className="text-base font-medium">{ownerText}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSubscribe}
      className="rounded-full disabled:cursor-not-allowed w-fit"
      disabled={createSubscriber.isPending || isOwner}
    >
      <span className="text-base font-medium">
        {subscribed ? "Unsubscribe" : "Subscribed"}
      </span>
    </Button>
  );
};
