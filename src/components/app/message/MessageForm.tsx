"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import MessageService from "@/services/message.service";
import { MessageDTO } from "@/types/message.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";
import AuthAlert from "@/components/app/common/AuthAlert";

interface MessageFormProps {
  conversationId: string;
}

export default function MessageForm({ conversationId }: MessageFormProps) {
  const { isAuthenticated, isLoading } = useSession();
  const { register, handleSubmit, watch, reset } = useForm<MessageDTO>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: MessageDTO) => {
      await MessageService.createMessage({
        ...data,
        conversationId,
      });
    },
    onSuccess: () => {
      reset();
      toast.success("Message sent successfully!");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const onSubmit = async (data: MessageDTO) => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour envoyer un message");
      return;
    }
    mutation.mutate(data);
  };

  const contentWatch = watch("content");

  if (isLoading) {
    return (
      <div className="relative my-5">
        <Input
          type="text"
          placeholder="Chargement..."
          className="py-6"
          disabled
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="my-5">
        <AuthAlert />
        <div className="relative">
          <Input
            type="text"
            placeholder="Type your message..."
            className="py-6"
            disabled
          />
          <Button
            type="button"
            className="absolute top-1/2 right-0 -translate-y-1/2 mr-2"
            disabled
          >
            Send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="relative my-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="text"
        placeholder="Type your message..."
        className="py-6"
        {...register("content")}
      />
      <Button
        type="submit"
        className="absolute top-1/2 right-0 -translate-y-1/2 mr-2"
        disabled={
          !contentWatch || contentWatch.trim() === "" || mutation.isPending
        }
      >
        {mutation.isPending && <Spinner className="mr-2" />}
        Send
      </Button>
    </form>
  );
}
