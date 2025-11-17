"use client";

import { useSession } from "@/hooks/useSession";
import ConversationDeleteButton from "./ConversationDeleteButton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, X, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import ConversationService from "@/services/conversation.service";

interface ConversationHeaderProps {
  conversation: {
    id: string;
    title: string;
    authorId: string | null;
    author?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
}

export default function ConversationHeader({
  conversation,
}: ConversationHeaderProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === conversation.authorId;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title || "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (title: string) => {
      return await ConversationService.updateById(conversation.id, title);
    },
    onSuccess: () => {
      toast.success("Conversation modifiée avec succès !");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalider aussi la query spécifique de cette conversation
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversation.id],
      });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la modification de la conversation"
      );
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(conversation.title || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(conversation.title || "");
  };

  const handleSave = () => {
    if (!editTitle.trim()) {
      toast.error("Le titre de la conversation ne peut pas être vide");
      return;
    }
    if (editTitle.trim() === conversation.title) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate(editTitle.trim());
  };

  return (
    <div className="p-4 rounded-md text-xl flex flex-col gap-2 relative">
      <div className="flex items-center gap-2">
        <span>Subject:</span>
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={updateMutation.isPending}
            className="flex-1"
          />
        ) : (
          <h1>{conversation?.title}</h1>
        )}
      </div>
      {conversation?.author && (
        <p className="text-sm text-muted-foreground">
          Par {conversation.author.name || conversation.author.email}
        </p>
      )}
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <ConversationDeleteButton id={conversation.id} />
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={
                  updateMutation.isPending ||
                  !editTitle.trim() ||
                  editTitle.trim() === conversation.title
                }
              >
                {updateMutation.isPending ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

