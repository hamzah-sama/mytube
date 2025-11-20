import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { fallbackUserPlaceholder } from "@/constant";
import { useTRPC } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  commentId: string;
  onCancel: () => void;
  onSuccess: () => void;
  videoPlaybackId: string;
}
export const CommentsRepliesForm = ({
  commentId,
  onCancel,
  onSuccess,
  videoPlaybackId,
}: Props) => {
  const { user, openSignIn } = useClerk();
  const trpc = useTRPC();
  const queryCLient = useQueryClient();

  const commentReplyType = z.object({
    commentId: z.string(),
    content: z.string(),
    videoPlaybackId: z.string(),
  });

  const form = useForm<z.infer<typeof commentReplyType>>({
    resolver: zodResolver(commentReplyType),
    defaultValues: {
      commentId,
      content: "",
      videoPlaybackId,
    },
  });

  const createReplies = useMutation(
    trpc.comments.addReply.mutationOptions({
      onSuccess: () => {
        queryCLient.invalidateQueries(
          trpc.comments.getMany.queryOptions({ videoPlaybackId })
        );
        toast.error("reply added");
        form.reset();
        onCancel();
        onSuccess();
      },
      onError: (err) => {
        toast.error(err.message);
        if (err.data?.code === "UNAUTHORIZED") {
          openSignIn();
        }
      },
    })
  );

  const submitComment = async (data: z.infer<typeof commentReplyType>) => {
    createReplies.mutate(data);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitComment)}
        className="flex flex-col space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-7 w-8 rounded-full overflow-hidden">
            <Image
              src={user?.imageUrl ?? fallbackUserPlaceholder}
              alt={user?.username ?? "no name"}
              fill
              objectFit="cover"
              priority={true}
            />
          </div>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Textarea
                    className="w-full resize-none h-auto"
                    placeholder="Add a reply..."
                    rows={1}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-red-400 hover:bg-red-500 w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createReplies.isPending}
            className="w-[100px]"
          >
            {createReplies.isPending ? (
              <Loader2Icon className="size-4 flex items-center justify-center animate-spin" />
            ) : (
              "Reply"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
