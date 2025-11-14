"use client";

import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";
import { useTRPC } from "@/trpc/client";
import MuxUploader from "@mux/mux-uploader-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const CreateVideoButton = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const createVideo = useMutation(
    trpc.video.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
        toast.success("Video created");
        setOpenModal(true);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const { data: statusData } = useQuery(
    trpc.video.getStatus.queryOptions(
      {
        videoId: createVideo.data?.video.id || "",
      },

      {
        enabled: !!createVideo.data?.video.id,
        refetchInterval: 3000,
      }
    )
  );

  useEffect(() => {
    if (statusData?.status === "ready") {
      setOpenModal(false);
      router.push(`/studio/video/${createVideo.data?.video.id}`);
    }
  }, [createVideo.data?.video.id, statusData?.status]);

  return (
    <>
      <UploadModal open={openModal} onOpenChange={setOpenModal} title="Upload your video">
        <MuxUploader endpoint={createVideo.data?.url} />
      </UploadModal>
      <Button
        variant="secondary"
        className="text-base font-medium"
        disabled={createVideo.isPending}
        onClick={() => createVideo.mutate({ title: "new video" })}
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
