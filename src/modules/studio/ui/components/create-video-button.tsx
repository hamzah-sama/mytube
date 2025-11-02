"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
}
export const CreateVideoButton = ({ userId }: Props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const createVideo = useMutation(
    trpc.video.create.mutationOptions({
      onSuccess: () => {
        toast.success("Video created");
        queryClient.invalidateQueries(
          trpc.studio.getMany.queryOptions({ userId })
        );
      },
    })
  );
  return (
    <Button
      variant="secondary"
      className="text-base font-medium"
      onClick={() => createVideo.mutate({ userId, title: "new video" })}
    >
      <Plus className="size-4" />
      Create video
    </Button>
  );
};
