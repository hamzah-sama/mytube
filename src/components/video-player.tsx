import MuxPlayer from "@mux/mux-player-react";

interface Props {
  playbackId: string | undefined;
  imageThumbnail: string;
  isAutoPlay: boolean;
  handlePlay: () => void;
}
export const VideoPlayer = ({
  playbackId,
  imageThumbnail,
  isAutoPlay,
  handlePlay,
}: Props) => {
  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={imageThumbnail}
      className="w-full h-full object-contain"
      autoPlay={isAutoPlay}
      playerInitTime={0}
      accentColor="#ff2056"
      onPlay={handlePlay}
    />
  );
};
