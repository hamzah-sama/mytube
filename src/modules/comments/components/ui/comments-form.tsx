import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { fallbackUserPlaceholder } from "@/constant";
import { commentInsertSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  videoPlaybackId: string;
}
export const CommentsForm = ({ videoPlaybackId }: Props) => {
  const { user, openSignIn } = useClerk();
  const trpc = useTRPC();
  const queryCLient = useQueryClient();

  const commentType = z.object({
    videoPlaybackId: z.string(),
    content: commentInsertSchema.shape.content,
  });

  const form = useForm<z.infer<typeof commentType>>({
    resolver: zodResolver(commentType),
    defaultValues: {
      videoPlaybackId,
      content: "",
    },
  });

  const createComment = useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess: () => {
        queryCLient.invalidateQueries(
          trpc.comments.getMany.queryOptions({ videoPlaybackId })
        );

        toast.success("Comment added");
        form.reset();
      },
      onError: (err) => {
        toast.error(err.message);
        if (err.data?.code === "UNAUTHORIZED") {
          openSignIn();
        }
      },
    })
  );

  const submitComment = async (data: z.infer<typeof commentType>) => {
    createComment.mutate(data);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitComment)}
        className="flex flex-col space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-11 rounded-full overflow-hidden">
            <Image
              src={user?.imageUrl ?? fallbackUserPlaceholder}
              alt={user?.username ?? "no name"}
              fill
              objectFit="cover"
              priority={true}
            />
          </div>
          <FormField
            name="content"
            render={({ field }) => (
              <Textarea
                className="w-full resize-none h-auto"
                placeholder="Add a comment..."
                rows={1}
                {...field}
              />
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createComment.isPending}
            className="w-[100px]"
          >
            {createComment.isPending ? (
              <Loader2Icon className="size-4 flex items-center justify-center animate-spin" />
            ) : (
              "Comment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
