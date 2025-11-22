import { VideoView } from "@/modules/videos/view/video-view";

interface Props {
  params: Promise<{ videoPlaybackId: string }>;
}

const Page = async ({ params }: Props) => {
  const { videoPlaybackId } = await params;

  return (
    <div className="flex flex-col mx-auto max-w-[1700px] mb-10 p-2 overflow-hidden">
      <VideoView videoPlaybackId={videoPlaybackId} />
    </div>
  );
};

export default Page;
