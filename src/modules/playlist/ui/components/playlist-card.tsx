import { fallbackThumbnail } from "@/constant";
import { ListIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  name: string;
  id: string;
  videosCount: number;
  thumbnail?: string | null;
}

export const PlaylistCard = ({ name, id, videosCount, thumbnail }: Props) => {
  return (
    <Link href={`/playlist/${id}`}>
      <div className="relative group">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl aspect-video bg-black/20 dark:bg-white/10"/>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl aspect-video bg-black/25 dark:bg-white/15"/>
        <div className="relative aspect-video w-full rounded-xl overflow-hidden">
          <Image
            src={thumbnail || fallbackThumbnail}
            alt={name}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black/30 text-xs p-2 px-4 rounded-xl flex gap-2 items-center group-hover:bg-black">
            <ListIcon className="size-4" />
            {videosCount} {videosCount === 1 ? "video" : "videos"}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white bg-black/70">
            <PlayIcon className="mr-2" />
            Play all
          </div>
        </div>
        <p className="text-base font-medium">{name}</p>
        <p className="text-muted-foreground text-sm">Playlist</p>
        <p className="text-muted-foreground text-sm">View all playlist</p>
      </div>
    </Link>
  );
};
