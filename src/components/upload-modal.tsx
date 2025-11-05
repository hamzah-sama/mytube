"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import MuxUploader from "@mux/mux-uploader-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface Props {
  url: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const UploadModal = ({ open, url, onOpenChange }: Props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="flex justify-center items-center pt-4">
            <DrawerTitle className="hidden">Upload your video</DrawerTitle>
          </DrawerHeader>
          <MuxUploader endpoint={url} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex justify-center items-center pt-4">
          <DialogTitle className="hidden">Upload your video</DialogTitle>
        </DialogHeader>
        <MuxUploader endpoint={url} />
      </DialogContent>
    </Dialog>
  );
};
