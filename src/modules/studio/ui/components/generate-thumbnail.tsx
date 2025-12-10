import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  videoId: string;
  setOpenGenerateThumbnail: (openGenerateThumbnail: boolean) => void;
  setIsGeneratingThumbnail: (isGeneratingThumbnail: boolean) => void;
}
export const GenerateThumbnailModal = ({
  videoId,
  setOpenGenerateThumbnail,
  setIsGeneratingThumbnail,
}: Props) => {
  const trpc = useTRPC();
  const formSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    videoId: z.string(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      videoId,
    },
  });

  const generateThumbnail = useMutation(
    trpc.studio.generateThumbnail.mutationOptions({
      onSuccess: () => {
        setIsGeneratingThumbnail(true);
        setOpenGenerateThumbnail(false);
        form.reset();
        toast.info("Processing generate thumbnail");
      },
      onError: (err) => {
        toast.error("Failed to generate thumbnail");
      },
    })
  );

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="prompt"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Textarea
                {...field}
                className="max-h-[100px] min-h-[100px] resize-none"
                placeholder="write description you want for thumbnail"
              />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-5">
          <Button disabled={generateThumbnail.isPending} type="submit">
            Generate
          </Button>
        </div>
      </form>
    </Form>
  );
};
