import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";

interface Props {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  isPending: boolean;
}

export const HeaderField = ({ setOpenModal, isPending }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Video details</h1>
        <h6 className="text-sm text-muted-foreground">
          Manage your video details
        </h6>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button">
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <div
                className="flex items-center gap-2 w-full cursor-pointer"
                onClick={() => setOpenModal(true)}
              >
                <Trash2Icon className="size-4 text-red-500" />
                <span className="text-sm">Delete</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
