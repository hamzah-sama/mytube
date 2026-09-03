import { fallbackThumbnail } from "@/constant";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { videoCardType } from "@/type";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Props {
  userImageUrl: string | null;
  userName: string | null;
  title: string;
  count: number;
  createdAt: Date;
  videoOwnerId: string;
  videoId: string;
}

export const VideoDescription = ({
  userImageUrl,
  userName,
  title,
  count,
  createdAt,
  videoOwnerId,
  videoId,
}: Props) => {
  return (
    <div className="flex gap-3">
      <div className="relative rounded-full size-12 shrink-0">
        <Image
          src={userImageUrl || fallbackThumbnail}
          alt={userName || "user"}
          fill
          className="object-cover rounded-full"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-base font-semibold line-clamp-2 ">{title}</p>
        <p className="text-muted-foreground text-sm">{userName}</p>
        <p>
          {count} views | {formatDistanceToNow(createdAt, { addSuffix: true })}
        </p>
      </div>
      <GeneralVideoDropdown videoOwnerId={videoOwnerId} videoId={videoId} />
    </div>
  );
};
