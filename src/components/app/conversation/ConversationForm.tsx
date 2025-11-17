"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import ConversationService from "@/services/conversation.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Info } from "lucide-react";

interface ConversationFormData {
  title: string;
}

export default function ConversationForm() {
  const { isAuthenticated, isLoading } = useSession();
  const { register, handleSubmit, watch, reset } =
    useForm<ConversationFormData>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ConversationFormData) => {
      const conversation = await ConversationService.createConversation(data);
      return conversation;
    },
    onSuccess: (conversation) => {
      reset();
      toast.success("Conversation créée avec succès !");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la création de la conversation"
      );
    },
  });

  const onSubmit = async (data: ConversationFormData) => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour créer une conversation");
      return;
    }
    mutation.mutate(data);
  };

  const titleWatch = watch("title");

  if (isLoading) {
    return (
      <div className="mb-4">
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
      <div className="mb-4">
        <Alert variant="destructive" className="mb-4">
          <Info />
          <AlertTitle>Authentification requise</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 mt-2">
            <p>Vous devez être connecté pour créer une conversation.</p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/signin">Se connecter</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form className="relative mb-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="text"
        placeholder="Titre de la nouvelle conversation..."
        className="py-6"
        {...register("title", {
          required: "Le titre est requis",
          minLength: {
            value: 3,
            message: "Le titre doit contenir au moins 3 caractères",
          },
        })}
      />
      <Button
        type="submit"
        className="absolute top-1/2 right-0 -translate-y-1/2 mr-2"
        disabled={!titleWatch || titleWatch.trim() === "" || mutation.isPending}
      >
        {mutation.isPending && <Spinner className="mr-2" />}
        Créer
      </Button>
    </form>
  );
}
