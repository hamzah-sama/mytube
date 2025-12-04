import { VideoThumbnail } from "@/components/video-thumbnail";
import { fallbackThumbnail } from "@/constant";
import { videoCardType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface Props {
  data: videoCardType;
  dropdown: React.ReactNode;
}
export const VideoCardColumn = ({ data, dropdown }: Props) => {
  return (
    <div className=" relative group hover:bg-accent p-4 rounded-xl ">
      <Link
        href={`/video/${data.muxPlaybackId}`}
        className=" flex flex-col gap-3"
      >
        <div className="relative w-full aspect-video">
          <VideoThumbnail
            thumbnail={data.thumbnailUrl}
            preview={data.previewUrl}
            duration={data.duration}
          />
        </div>
        <div className="flex justify-between w-full relative">
          <div className="flex gap-3">
            <div className="relative rounded-full size-12 shrink-0">
              <Image
                src={data.user.imageUrl || fallbackThumbnail}
                alt={data.user.name || "user"}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold line-clamp-2">
                {data.title}
              </p>
              <p className="text-muted-foreground text-sm">{data.user.name}</p>
              <p>
                {data.count} views |{" "}
                {formatDistanceToNow(data.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute bottom-20 right-2">{dropdown}</div>
    </div>
  );
};
