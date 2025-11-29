import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ListPlusIcon, MoreVerticalIcon, Settings, XIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  userLoginId: string | undefined;
  videoOwnerId: string;
  variant?: "row" | "column";
  isLikePage?: boolean;
  isHistoryPage?: boolean;
  setOpenCancelLikeModal?: (open: boolean) => void;
  setOpenRemoveHistoryModal?: (open: boolean) => void;
  videoId?: string;
}

export const VideoDropdownMenu = ({
  userLoginId,
  videoOwnerId,
  variant = "column",
  isLikePage,
  setOpenCancelLikeModal,
  setOpenRemoveHistoryModal,
  videoId,
  isHistoryPage,
}: Props) => {
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "oklch(0.708 0 0)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            className={cn(
              variant === "column" && "absolute top-2 -right-4",
              "rounded-full"
            )}
          >
            <MoreVerticalIcon className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        {userLoginId === videoOwnerId ? (
          <VideoOwneraction
            isLikePage={isLikePage}
            setOpenCancelLikeModal={setOpenCancelLikeModal}
            videoId={videoId}
            isHistoryPage={isHistoryPage}
            setOpenRemoveHistoryModal={setOpenRemoveHistoryModal}
          />
        ) : (
          <UserAction
            isLikePage={isLikePage}
            setOpenCancelLikeModal={setOpenCancelLikeModal}
            isHistoryPage={isHistoryPage}
            setOpenRemoveHistoryModal={setOpenRemoveHistoryModal}
          />
        )}
      </DropdownMenu>
    </>
  );
};

interface ActionProps {
  isLikePage?: boolean;
  setOpenCancelLikeModal?: (open: boolean) => void;
  setOpenRemoveHistoryModal?: (open: boolean) => void;
  videoId?: string;
  isHistoryPage?: boolean;
}

export const VideoOwneraction = ({
  isLikePage,
  setOpenCancelLikeModal,
  setOpenRemoveHistoryModal,
  videoId,
  isHistoryPage,
}: ActionProps) => {
  return (
    <DropdownMenuContent onClick={(e) => e.preventDefault()}>
      <DropdownMenuItem asChild>
        <Link href={`/studio/video/${videoId}`} className="inline-flex gap-4">
          <Settings className="size-4" />
          Manage video
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <ListPlusIcon className="size-4 mr-2" />
        Add to playlist
      </DropdownMenuItem>
      {isLikePage && (
        <DropdownMenuItem
          onClick={() => {
            setOpenCancelLikeModal?.(true);
          }}
        >
          <XIcon className="size-4 mr-2" />
          Cancel like video
        </DropdownMenuItem>
      )}
      {isHistoryPage && (
        <DropdownMenuItem onClick={() => setOpenRemoveHistoryModal?.(true)}>
          <XIcon className="size-4 mr-2" />
          Remove from history
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
};

export const UserAction = ({
  isLikePage,
  setOpenCancelLikeModal,
  setOpenRemoveHistoryModal,
  isHistoryPage,
}: ActionProps) => {
  return (
    <DropdownMenuContent onClick={(e) => e.preventDefault()}>
      <DropdownMenuItem>
        <ListPlusIcon className="size-4 mr-2" />
        Add to playlist
      </DropdownMenuItem>
      {isLikePage && (
        <DropdownMenuItem
          onClick={() => {
            setOpenCancelLikeModal?.(true);
          }}
        >
          <XIcon className="size-4 mr-2" />
          Cancel like video
        </DropdownMenuItem>
      )}
      {isHistoryPage && (
        <DropdownMenuItem onClick={() => setOpenRemoveHistoryModal?.(true)}>
          <XIcon className="size-4 mr-2" />
          Remove from history
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
};
