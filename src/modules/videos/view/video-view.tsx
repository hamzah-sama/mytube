import { CommentSection } from "../components/comment-section";
import { VideoSection } from "../components/video-section";
import { SugestionSection } from "../components/video-sugestion";

interface Props {
  videoPlaybackId: string;
}
export const VideoView = ({ videoPlaybackId }: Props) => {
  return (
    <div className="flex flex-col mx-auto max-w-[1700px] mb-10 p-2">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoPlaybackId={videoPlaybackId} />
        </div>
        <div className="hidden lg:block w-[400px]">
          <SugestionSection />
        </div>
        <div className="lg:hidden flex flex-col gap-4">
          <CommentSection />
          <SugestionSection />
        </div>
      </div>
      <div className="lg:block hidden">
        <CommentSection />
      </div>
    </div>
  );
};
