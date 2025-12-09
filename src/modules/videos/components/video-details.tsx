import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { videoDetailsType } from "@/type";
import { VideoDescription } from "./video-details/description";
import { UserInfo } from "./video-details/user-info";
import { VideoReaction } from "./video-details/reaction";
import { CopyButton } from "./video-details/copy-button";
import { useAuth, useUser } from "@clerk/nextjs";
import { GeneralVideoDropdown } from "@/modules/home/ui/components/general-video-dropdown";
import { SubscribeButton } from "@/modules/subscriptions/ui/subscribe-button";

interface Props {
  video: videoDetailsType;
}

export const VideoDetails = ({ video }: Props) => {
  const { user } = useUser();
  const { userId } = useAuth();
  return (
    <div className="p-2 flex flex-col gap-2">
      <p className="font-bold text-2xl">{video.title}</p>
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <UserInfo video={video} />
                <SubscribeButton
                  videoId={video.id}
                  videoPlaybackId={video.muxPlaybackId}
                  isOwner={userId === video.user.clerkId}
                  ownerLink={`/studio/video/${video.id}`}
                  ownerText='Manage video'
                />
                {/* <SubscribeButton video={video} /> */}
              </div>
              <div className="flex items-center gap-6">
                <VideoReaction
                  videoPlaybackId={video.muxPlaybackId}
                  videoId={video.id}
                  likedCount={video.likedCount}
                  dislikedCount={video.dislikeCount}
                />
                <CopyButton video={video} />
                <GeneralVideoDropdown
                  userLoginId={user?.id}
                  videoOwnerId={video.user.clerkId}
                  videoId={video.id}
                />
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
