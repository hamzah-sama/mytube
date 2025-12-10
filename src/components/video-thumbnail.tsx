import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface Props {
  thumbnail?: string | null;
  preview?: string | null;
  duration?: number;
}
export const VideoThumbnail = ({ thumbnail, preview, duration }: Props) => {
  return (
    <div className="relative group">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden group-hover:rounded-none transition-all duration-300">
        <Image
          src={thumbnail ? thumbnail : "/placeholder.svg"}
          alt="thumbnail"
          fill
          className="object-cover group-hover:opacity-0"
        />
        <Image
          src={preview ? preview : "/placeholder.svg"}
          alt="thumbnail"
          fill
          className="object-cover group-hover:opacity-100 opacity-0"
        />
      </div>
      <div className="absolute bottom-2 right-2 bg-black text-white px-1 py-0.5 rounded-md">
        <span className="text-xs">
          {duration == null ? "--:--" : formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};
