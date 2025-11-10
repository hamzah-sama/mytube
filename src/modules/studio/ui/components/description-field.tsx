import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Control, FieldValues, useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  control: Control<FieldValues, any, FieldValues> | undefined;
  videoId: string;
  value?: string;
}
export const DescriptionField = ({ control, videoId, value }: Props) => {
  const queryClient = useQueryClient();
  const [isgenerateDescription, setIsgenerateDescription] = useState(false);
  const trpc = useTRPC();
  const generateDescription = useMutation(
    trpc.video.generateDescription.mutationOptions({
      onSuccess: () => {
        setIsgenerateDescription(true);
        toast.info("Description generated processing...");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const { data: description } = useQuery(
    trpc.video.getTitleWorkFlow.queryOptions(
      { videoId },
      {
        enabled: isgenerateDescription,
        refetchInterval: 3000,
      }
    )
  );

  useEffect(() => {
    if (description?.status !== "success") return;
    if (description?.status === "success") {
      setIsgenerateDescription(false);
      queryClient.invalidateQueries(trpc.studio.getMany.queryOptions());
      queryClient.invalidateQueries(
        trpc.studio.getOne.queryOptions({ videoId })
      );
      toast.success("successfully generate description");
    }
  }, [description?.status]);

  const { setValue } = useFormContext();

  useEffect(() => {
    if (value) {
      setValue("description", value);
    }
  }, [value, setValue]);

  return (
    <FormField
      name="description"
      control={control}
      render={({ field }) => (
        <FormItem
          className={cn(isgenerateDescription && "cursor-not-allowed opacity-20")}
        >
          <div className="flex items-center gap-5">
            <FormLabel>Description</FormLabel>
            <Hint side="right" text="AI-generate">
              <Button
                variant="ghost"
                disabled={generateDescription.isPending}
                size="icon"
                type="button"
                onClick={() => generateDescription.mutate({ videoId })}
              >
                <SparklesIcon className="size-4" />
              </Button>
            </Hint>
          </div>
          <FormControl>
            <Textarea
              {...field}
              placeholder="Add a title to your video"
              disabled={isgenerateDescription}
              className="min-h-[150px] max-h-[150px] resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
