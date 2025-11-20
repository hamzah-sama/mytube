import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { videoType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  data: videoType;
}
export const VideoCard = ({ data }: Props) => {
  return (
    <Link href={`/video/${data.muxPlaybackId}`}>
      <div className="lg:w-full flex justify-between">
        <div className="flex gap-2 flex-col lg:flex-row">
          <div className="relative aspect-video lg:w-40 w-70 shrink-0">
            <VideoThumbnail
              thumbnail={data.thumbnailUrl}
              preview={data.previewUrl}
              duration={data.duration}
            />
          </div>
          <div className="flex justify-between w-70">
            <div className="flex flex-col">
              <div className="flex flex-col text-sm max-w-50">
                <h2 className="font-semibold line-clamp-2">{data.title}</h2>
                <p className="text-muted-foreground line-clamp-1">
                  {data.user.name}
                </p>
                <p className="text-muted-foreground line-clamp-1">
                  {data.count} views |{" "}
                  {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
