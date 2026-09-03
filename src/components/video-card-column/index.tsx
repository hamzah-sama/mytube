import { VideoThumbnail } from "@/components/video-thumbnail";
import { videoCardType } from "@/type";
import Link from "next/link";
import { VideoDescription } from "./video-description";

interface Props {
  data: videoCardType;
  dropdown?: React.ReactNode;
}
export const VideoCardColumn = ({ data }: Props) => {
  const { thumbnailUrl, previewUrl, duration, user, title, count, createdAt } =
    data;
  return (
    <div className="relative group hover:bg-accent p-4 rounded-xl ">
      <Link
        href={`/video/${data.muxPlaybackId}`}
        className=" flex flex-col gap-3"
      >
        <div className="relative w-full aspect-video">
          <VideoThumbnail
            thumbnail={thumbnailUrl}
            preview={previewUrl}
            duration={duration}
          />
        </div>
        <VideoDescription
          userImageUrl={user.imageUrl}
          userName={user.name}
          title={title}
          count={count}
          createdAt={createdAt}
          videoOwnerId={user.clerkId}
          videoId={data.id}
        />
      </Link>
    </div>
  );
};
