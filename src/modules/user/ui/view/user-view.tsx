"use client";
import { SubscribeButton } from "@/modules/subscriptions/ui/subscribe-button";
import { useTRPC } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { UserContent } from "../components/user-content";
import { UserDetails } from "../components/user-details";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import { UploadModal } from "@/components/upload-modal";
import { UploadDropzone } from "@/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";

interface Props {
  userId: string;
}

export const UserView = ({ userId }: Props) => {
  const trpc = useTRPC();
  const { userId: clerkUserId } = useAuth();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const { data } = useSuspenseQuery(trpc.user.getOne.queryOptions({ userId }));
  const queryClient = useQueryClient();

  const onUpdateComplete = () => {
    setOpenUploadModal(false);
    queryClient.invalidateQueries(trpc.user.getOne.queryOptions({ userId }));
  };

  return (
    <>
      <UploadModal
        open={openUploadModal}
        onOpenChange={setOpenUploadModal}
        title="Upload your banner"
      >
        <div className="cursor-pointer">
          <UploadDropzone
            endpoint="bannerUploader"
            onClientUploadComplete={onUpdateComplete}
          />
        </div>
      </UploadModal>
      <div className="flex flex-col gap-4">
        <div className="h-[200px] w-full bg-muted-foreground rounded-xl relative overflow-hidden">
          {data?.bannerUrl && (
            <Image
              src={data.bannerUrl}
              alt="banner"
              fill
              className="object-cover"
            />
          )}

          {clerkUserId === data.clerkId && (
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => setOpenUploadModal(true)}
            >
              <CameraIcon />
            </Button>
          )}
        </div>
        <UserDetails userId={userId}>
          <SubscribeButton
            userId={data.id}
            isOwner={clerkUserId === data?.clerkId}
            ownerLink="/studio"
            ownerText="Go to studio"
          />
        </UserDetails>
        <UserContent userId={userId} clerkUserId={clerkUserId} />
      </div>
    </>
  );
};
