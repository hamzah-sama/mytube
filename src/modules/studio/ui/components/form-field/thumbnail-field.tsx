import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ImageIcon,
  LoaderIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UploadModal } from "@/components/upload-modal";
import { UploadDropzone } from "@/utils/uploadthing";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  thumbnailUrl: string;
  previewUrl: string;
  imageAlt: string;
  videoId: string;
  setOPenGenerateThumbnail: (openGenerateThumbnail: boolean) => void;
  isGeneratingThumbnail: boolean;
  setIsGeneratingThumbnail: (isGeneratingThumbnail: boolean) => void;
  workflowThumbnailStatus?: "processing" | "success" | null;
}
export const ThumbnailField = ({
  thumbnailUrl,
  previewUrl,
  imageAlt,
  videoId,
  setOPenGenerateThumbnail,
  isGeneratingThumbnail,
  workflowThumbnailStatus,
  setIsGeneratingThumbnail,
}: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const onUpdateComplete = () => {
    setOpenUploadModal(false);
    queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
    queryClient.invalidateQueries(trpc.studio.getOne.queryOptions({ videoId }));
  };

  const restoreThumbnail = useMutation(
    trpc.video.restoreThumbnail.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.studio.getOne.queryOptions({ videoId })
        );
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );
  const [openEditThumbnail, setOPenEditThumbnail] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const { data: workflow } = useQuery(
    trpc.video.getThumbnailWorkFlow.queryOptions(
      { videoId },
      {
        enabled: isGeneratingThumbnail,
        refetchInterval: 3000,
      }
    )
  );

  useEffect(() => {
    if (!workflow?.status) return;
    if (workflow?.status === "success") {
      setIsGeneratingThumbnail(false);
      queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
      queryClient.invalidateQueries(
        trpc.studio.getOne.queryOptions({ videoId })
      );
      toast.success("successfully generate thumbnail");
    }
  }, [workflow?.status]);

  return (
    <>
      <UploadModal
        open={openUploadModal}
        onOpenChange={setOpenUploadModal}
        title="Upload your image"
      >
        <div className="cursor-pointer">
          <UploadDropzone
            endpoint="thumbnailUploader"
            input={{ videoId }}
            onClientUploadComplete={onUpdateComplete}
          />
        </div>
      </UploadModal>
      <div className="flex flex-col gap-2">
        <p>Thumbnail</p>
        <div
          className={cn(
            "relative w-[200px] aspect-video group",
            restoreThumbnail.isPending && "opacity-10"
          )}
        >
          <Image
            src={thumbnailUrl}
            alt={imageAlt}
            fill
            className={cn(
              "object-cover rounded-md opacity-100 group-hover:opacity-0",
              isGeneratingThumbnail && "opacity-20 group-hover:opacity-20"
            )}
          />
          <Image
            src={previewUrl}
            alt={imageAlt}
            fill
            className={cn(
              "object-cover rounded-md opacity-0 group-hover:opacity-100",
              isGeneratingThumbnail && "opacity-0 group-hover:opacity-0"
            )}
          />
          {isGeneratingThumbnail && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <LoaderIcon className="size-4 animate-spin" />
            </div>
          )}
          <DropdownMenu
            open={openEditThumbnail}
            onOpenChange={setOPenEditThumbnail}
          >
            <DropdownMenuTrigger asChild>
              <button
                disabled={isGeneratingThumbnail}
                className={cn(
                  "hover:bg-black/50 group-hover:opacity-100 bg-black/50 absolute top-1 right-1 text-white px-1 py-0.5 rounded-md lg:opacity-0",
                  isGeneratingThumbnail && "opacity-0 group-hover:opacity-0"
                )}
              >
                <MoreVerticalIcon className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              onMouseEnter={() => setOPenEditThumbnail(true)}
              onMouseLeave={() => setOPenEditThumbnail(false)}
            >
              <DropdownMenuItem onClick={() => setOpenUploadModal(true)}>
                <ImageIcon className="size-4 mr-2" />
                Change image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => restoreThumbnail.mutate({ videoId })}
                className={cn(
                  restoreThumbnail.isPending &&
                    "cursor-not-allowed bg-opacity-50"
                )}
              >
                <RotateCcwIcon className="size-4 mr-2" />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOPenGenerateThumbnail(true)}>
                <SparklesIcon className="size-4 mr-2" />
                AI-generate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};
