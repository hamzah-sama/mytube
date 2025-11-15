import { VideoAlert } from "@/components/video-alert";
import { VideoPlayer } from "@/components/video-player";
import { fallbackThumbnail } from "@/constant";

interface Props {
  playbackId: string | null;
  thumbnailUrl: string | null;
  videoStatus: string | null;
}
export const VideoField = ({
  playbackId,
  thumbnailUrl,
  videoStatus,
}: Props) => {
  return (
    <div className="relative aspect-video w-full">
      <div className="flex flex-col">
        <VideoPlayer
          playbackId={playbackId ?? fallbackThumbnail}
          imageThumbnail={thumbnailUrl ?? fallbackThumbnail}
          isAutoPlay
        />
        {videoStatus !== "ready" && <VideoAlert />}
      </div>
    </div>
  );
};
