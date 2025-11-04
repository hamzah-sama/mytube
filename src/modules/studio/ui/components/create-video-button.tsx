"use client";

import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  userId: string;
}
export const CreateVideoButton = ({ userId }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const createVideo = useMutation(
    trpc.video.create.mutationOptions({
      onSuccess: () => {
        toast.success("Video created");
        setOpenModal(true);
        queryClient.invalidateQueries(
          trpc.studio.getMany.queryOptions({ userId })
        );
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  console.log(createVideo.data);
  return (
    <>
      <UploadModal url={createVideo.data?.url} open={openModal} onOpenChange={setOpenModal} />
      <Button
        variant="secondary"
        className="text-base font-medium"
        disabled={createVideo.isPending}
        onClick={() => createVideo.mutate({ userId, title: "new video" })}
      >
        {createVideo.isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Create video
      </Button>
    </>
  );
};
