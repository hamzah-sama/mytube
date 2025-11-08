import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  desription: string;
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  desription,
  isLoading,
}: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{desription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isLoading}
            className="bg-red-500 disabled:opacity-50 hover:bg-red-400 disabled:cursor-not-allowed"
            onClick={onConfirm}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2Icon className="animate-spin size-4" />
                <span className="text-sm text-muted-foreground">
                  Deleting...
                </span>
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
