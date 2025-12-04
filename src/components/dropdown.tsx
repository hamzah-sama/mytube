import { MoreVerticalIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  variant?: "row" | "column";
}

export const Dropdown = ({ children, variant }: Props) => {
  return (
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
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
