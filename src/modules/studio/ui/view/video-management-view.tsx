"use client";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { Form } from "@/components/ui/form";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoUpdateSchema } from "@/db/schema";
import z from "zod";

import { fallbackThumbnail } from "@/constant";
import { ThumbnailField } from "../components/form-field/thumbnail-field";
import { ResponsiveModal } from "@/components/responsiveModal";
import { GenerateThumbnailModal } from "../components/generate-thumbnail";
import { TitleField } from "../components/form-field/title-field";
import { DescriptionField } from "../components/form-field/description-field";
import { CategoriesField } from "../components/form-field/categories-field";
import { VisibilityField } from "../components/form-field/visibility-field";
import { HeaderField } from "../components/form-field/header-field";
import { VideoField } from "../components/form-field/video-field";
import { VideoLinkField } from "../components/form-field/video-link-field";

interface Props {
  videoId: string;
}

export const VideoManagementView = ({ videoId }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [openGenerateThumbnail, setOpenGenerateThumbnail] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: video } = useSuspenseQuery(
    trpc.studio.getOne.queryOptions({ videoId })
  );

  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const handleDelete = useMutation(
    trpc.studio.delete.mutationOptions({
      onSuccess: () => {
        setOpenModal(false);
        queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.studio.getOne.queryOptions({ videoId })
        );
        router.push("/studio");
        toast.success("Video deleted");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const updateVideo = useMutation(
    trpc.studio.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.studio.getOne.queryOptions({ videoId })
        );
        router.push("/studio");
        toast.success("Video updated");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    updateVideo.mutate(data);
  };
  return (
    <>
      <ConfirmationModal
        open={openModal}
        onOpenChange={setOpenModal}
        description="this action cannot be undone, are you sure want to delete this video permanently?"
        onConfirm={() => handleDelete.mutate({ videoId })}
        isLoading={handleDelete.isPending}
      />

      <ResponsiveModal
        title="Generate thumbnail"
        open={openGenerateThumbnail}
        onOpenChange={setOpenGenerateThumbnail}
      >
        <GenerateThumbnailModal
          videoId={videoId}
          setOpenGenerateThumbnail={setOpenGenerateThumbnail}
          setIsGeneratingThumbnail={setIsGeneratingThumbnail}
        />
      </ResponsiveModal>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1400px] px-4 pt-2.5 relative">
            <HeaderField
              setOpenModal={setOpenModal}
              isPending={updateVideo.isPending}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 mt-5 space-x-5">
              <div className="col-span-3 flex flex-col space-y-10">
                <TitleField
                  control={form.control}
                  videoId={videoId}
                  value={video.title ?? ""}
                />
                <DescriptionField
                  control={form.control}
                  videoId={videoId}
                  value={video.description ?? ""}
                />
                <ThumbnailField
                  thumbnailUrl={video.thumbnailUrl ?? fallbackThumbnail}
                  previewUrl={video.previewUrl ?? fallbackThumbnail}
                  imageAlt={video.title ?? "thumbnail"}
                  videoId={video.id}
                  workflowThumbnailStatus={video.workflowThumbnailStatus}
                  setOPenGenerateThumbnail={setOpenGenerateThumbnail}
                  isGeneratingThumbnail={isGeneratingThumbnail}
                  setIsGeneratingThumbnail={setIsGeneratingThumbnail}
                />
                <CategoriesField
                  control={form.control}
                  categories={categories}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-5 pb-5">
                <div className="bg-[#f9f9f9] rounded-md relative overflow-hidden space-y-5 pb-5 dark:bg-gray-800">
                    <VideoField
                      playbackId={video.muxPlaybackId}
                      thumbnailUrl={video.thumbnailUrl}
                      videoStatus={video.muxStatus}
                    />
                  <VideoLinkField playbackId={video.muxPlaybackId} />
                  <div className="flex flex-col p-2">
                    <p className="text-sm text-muted-foreground">
                      Video status
                    </p>
                    <p className="font-medium capitalize">{video.muxStatus}</p>
                  </div>
                  <div className="flex flex-col p-2">
                    <p className="text-sm text-muted-foreground">
                      Track status
                    </p>
                    <p className="font-medium capitalize">
                      {video.muxTrackStatus ?? "No audio"}
                    </p>
                  </div>
                </div>
                <VisibilityField control={form.control} />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
