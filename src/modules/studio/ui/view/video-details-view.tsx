"use client";

import { ConfirmationModal } from "@/components/confirmation-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  GlobeIcon,
  LockIcon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoUpdateSchema } from "@/db/schema";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fallbackThumbnail, PUBLIC_URL } from "@/constant";
import { ThumbnailControl } from "../components/thumbnail-control";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import { Hint } from "@/components/hint";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  videoId: string;
}

export const VideoDetailsView = ({ videoId }: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: video } = useSuspenseQuery(
    trpc.studio.getOne.queryOptions({ videoId })
  );

  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(`${PUBLIC_URL}/watch/${videoId}`);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleDelete = useMutation(
    trpc.video.delete.mutationOptions({
      onSuccess: () => {
        setOpenModal(false);
        queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.studio.getOne.queryOptions({ videoId })
        );
        router.push("/studio");
        toast.success("Video deleted");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const updateVideo = useMutation(
    trpc.video.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.studio.getOne.queryOptions({ videoId })
        );
        router.push("/studio");
        toast.success("Video updated");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    updateVideo.mutate(data);
  };
  return (
    <>
      <ConfirmationModal
        open={openModal}
        onOpenChange={setOpenModal}
        desription="this action cannot be undone, are you sure want to delete this video permanently?"
        onConfirm={() => handleDelete.mutate({ videoId })}
        isLoading={handleDelete.isPending}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1400px] px-4 pt-2.5">
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
                  disabled={updateVideo.isPending}
                  className="disabled:cursor-not-allowed"
                >
                  {updateVideo.isPending ? "Saving..." : "Save changes"}
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

            <div className="grid grid-cols-1 lg:grid-cols-5 mt-5 space-x-5">
              <div className="col-span-3 flex flex-col space-y-10">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Add a title to your video"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add description to your video"
                          style={{ height: "auto" }}
                          value={field.value ?? ""}
                          className="resize-none min-h-[100px] max-h-[100px] overflow-y-auto"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="thumbnailUrl"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>
                      <ThumbnailControl
                        thumbnailUrl={video.thumbnailUrl ?? fallbackThumbnail}
                        previewUrl={video.previewUrl ?? fallbackThumbnail}
                        imageAlt={video.title ?? "thumbnail"}
                        videoId={video.id}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  name="categoryId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ?? ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 flex flex-col gap-5 pb-5">
                <div className="bg-[#f9f9f9] rounded-md relative overflow-hidden space-y-5 pb-5 dark:bg-gray-800">
                  <div className="relative aspect-video w-full">
                    <MuxPlayer
                      playbackId={video.muxPlaybackId ?? fallbackThumbnail}
                    />
                  </div>
                  <div className="flex flex-col p-2">
                    <p className="text-sm text-muted-foreground">Video link</p>
                    <div className="flex items-center justify-between">
                      <Hint text="Open in new tab" side="bottom" align="center">
                        <Link
                          href={`${PUBLIC_URL}/video/${video.muxPlaybackId}`}
                          className="max-w-[450px] block truncate text-blue-500 hover:underline"
                          target="_blank"
                        >
                          <span>{`${PUBLIC_URL}/video/${video.muxPlaybackId}`}</span>
                        </Link>
                      </Hint>
                      <Hint text="Copy link" side="bottom" align="end">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={handleCopy}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </Hint>
                    </div>
                  </div>
                  <div className="flex flex-col p-2">
                    <p className="text-sm text-muted-foreground">
                      Video status
                    </p>
                    <p className="font-medium capitalize">{video.muxStatus}</p>
                  </div>
                  <div className="flex flex-col p-2">
                    <p className="text-sm text-muted-foreground">
                      Track status
                    </p>
                    <p className="font-medium capitalize">
                      {video.muxTrackStatus ?? "No audio"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-5">
                  <FormField
                    name="visibility"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">
                                <GlobeIcon className="mr-2 size-4" />
                                Public
                              </SelectItem>
                              <SelectItem value="private">
                                <LockIcon className="mr-2 size-4" />
                                Private
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export const VideoDetailsViewSkeleton = () => {
  return (
    <div>
      <div className="max-w-[1400px] px-4 pt-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video details</h1>
            <h6 className="text-sm text-muted-foreground">
              Manage your video details
            </h6>
          </div>
          <Skeleton className="h-5 w-15" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 mt-5 space-x-5">
          <div className="col-span-3 flex flex-col space-y-10">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-40 w-xl" />
            </div>
            <Skeleton className="h-30 w-44" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-xl" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-5 pb-5">
            <div className="bg-[#f9f9f9] rounded-md relative overflow-hidden space-y-5 pb-5 dark:bg-gray-800">
              <Skeleton className="h-52 w-full" />
              <div className="flex flex-col p-2 gap-2">
                <Skeleton className="h-5 w-20" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-[400px]" />
                  <Skeleton className="size-5" />
                </div>
              </div>
              <div className="flex flex-col p-2 gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-col p-2 gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex flex-col space-y-5">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
