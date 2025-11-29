import { VideoThumbnail } from "@/components/video-thumbnail";
import { videoCardType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { VideoDropdownMenu } from "./video-dropdown-menu";
import { useUser } from "@clerk/nextjs";

interface Props {
  data: videoCardType;
}
export const VideoCard = ({ data }: Props) => {
  const {user} = useUser()
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
            <VideoDropdownMenu userLoginId={user?.id} videoOwnerId={data.user.clerkId} variant="row"/>
          </div>
        </div>
      </div>
    </Link>
  );
};
