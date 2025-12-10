import { videoDetailsType } from "@/type";
import Image from "next/image";
import Link from "next/link";

interface Props {
  video: videoDetailsType;
}

export const UserInfo = ({ video }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <Link
        className="rounded-full h-8 w-8 lg:h-12 lg:w-12 relative"
        href={`/users/${video.user.id}`}
      >
        <Image
          src={video.user.imageUrl}
          alt="thumbnail"
          fill
          className="object-cover rounded-full"
        />
      </Link>
      <div className="flex flex-col text-left ">
        <Link href={`/users/${video.user.id}`}>
          <p className="text-sm lg:text-xl font-medium lg:font-semibold truncate w-full">
            {video.user.name}
          </p>
        </Link>
        <span className="text-muted-foreground text-sm lg:text-base">
          {Intl.NumberFormat("en", { notation: "standard" }).format(video.user.subscribersCount)}{' '}
          {video.user.subscribersCount <= 1 ? "subscriber" : "subscribers"}
        </span>
      </div>
    </div>
  );
};
