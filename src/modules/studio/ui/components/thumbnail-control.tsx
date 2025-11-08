import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ImageIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { UploadModal } from "@/components/upload-modal";
import { UploadDropzone } from "@/utils/uploadthing";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  thumbnailUrl: string;
  previewUrl: string;
  imageAlt: string;
  videoId: string;
}
export const ThumbnailControl = ({
  thumbnailUrl,
  previewUrl,
  imageAlt,
  videoId,
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
          className="object-cover rounded-md opacity-100 group-hover:opacity-0"
        />
        <Image
          src={previewUrl}
          alt={imageAlt}
          fill
          className="object-cover rounded-md opacity-0 group-hover:opacity-100"
        />
        <DropdownMenu
          open={openEditThumbnail}
          onOpenChange={setOPenEditThumbnail}
        >
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-black/50 group-hover:opacity-100 bg-black/50 absolute top-1 right-1 text-white px-1 py-0.5 rounded-md lg:opacity-0">
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
                restoreThumbnail.isPending && "cursor-not-allowed bg-opacity-50"
              )}
            >
              <RotateCcwIcon className="size-4 mr-2" />
              Restore
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SparklesIcon className="size-4 mr-2" />
              Ai generate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
