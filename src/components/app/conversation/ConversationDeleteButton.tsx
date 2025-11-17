"use client";

import DeleteButton from "@/components/app/common/DeleteButton";
import ConversationService from "@/services/conversation.service";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationDeleteButtonProps {
  className?: string;
  id: string;
}

export default function ConversationDeleteButton({
  id,
  className,
}: ConversationDeleteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await ConversationService.deleteById(id);
    },
    onSuccess: () => {
      toast.success("Conversation supprimée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Si on est sur la page de détail, rediriger vers l'accueil
      if (pathname?.startsWith("/conversations/")) {
        router.push("/");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <Button
      variant="destructive"
      className={cn("bg-red-400", className)}
      onClick={handleDelete}
      disabled={mutation.isPending}
    >
      <Trash />
    </Button>
  );
}
