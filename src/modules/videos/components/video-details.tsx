import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { videoDetailsType } from "@/type";
import { MoreHorizontalIcon } from "lucide-react";
import { VideoDescription } from "./video-details/description";
import { UserInfo } from "./video-details/user-info";
import { SubscribeButton } from "./video-details/subscribe-button";
import { VideoReaction } from "./video-details/reaction";
import { CopyButton } from "./video-details/copy-button";

interface Props {
  video: videoDetailsType;
}

export const VideoDetails = ({ video }: Props) => {
  return (
    <div className="p-2 flex flex-col gap-2">
      <p className="font-bold text-2xl">{video.title}</p>
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <UserInfo video={video} />
                <SubscribeButton video={video} />
              </div>
              <div className="flex items-center gap-6">
                <VideoReaction
                  videoPlaybackId={video.muxPlaybackId}
                  videoId={video.id}
                  likedCount={video.likedCount}
                  dislikedCount={video.dislikeCount}
                />
                <CopyButton video={video} />
                <div className="rounded-full bg-accent p-3">
                  <MoreHorizontalIcon className="size-5" />
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <VideoDescription
        description={video.description || "No description"}
        createdAt={video.createdAt}
        totalViews={video.viewCount}
      />
    </div>
  );
};
