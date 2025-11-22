import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { fallbackUserPlaceholder } from "@/constant";
import { videoCardType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  data: videoCardType;
}

export const VideoCardRow = ({ data }: Props) => {
  return (
    <Link
      href={`/video/${data.muxPlaybackId}`}
      className="hover:bg-accent rounded-xl p-2 group flex-1"
    >
      <div className="flex flex-col lg:flex-row gap-3 w-full">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full lg:w-[400px] shrink-0">
          <VideoThumbnail
            thumbnail={data.thumbnailUrl}
            preview={data.previewUrl}
            duration={data.duration}
          />
        </div>

        {/* Info Section */}
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex flex-col flex-1 min-w-0 gap-2">
            <h2 className="font-semibold text-lg line-clamp-2">{data.title}</h2>
            <p className="text-muted-foreground text-sm line-clamp-1">
              {data.count} views ·{" "}
              {formatDistanceToNow(data.createdAt, { addSuffix: true })}
            </p>
            <div className="flex gap-2">
              <div className="size-7 overflow-hidden relative rounded-full shrink-0">
                <Image
                  src={data.user.imageUrl || fallbackUserPlaceholder}
                  alt={data.user.name || "User Placeholder"}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">{data.user.name}</p>
            </div>
            <div className="text-muted-foreground text-sm line-clamp-2">
              {data.description || "No description"}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "oklch(0.708 0 0)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
};
