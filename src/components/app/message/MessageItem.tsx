"use client";

import { Message } from "@/generated/prisma";
import DeleteButton from "../common/DeleteButton";
import MessageService from "@/services/message.service";
import { useSession } from "@/hooks/useSession";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, X, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

interface MessageItemProps {
  message: Message & {
    author?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
}

export default function MessageItem({ message }: MessageItemProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === message.authorId;
  const isModeratorOrAdmin =
    session?.user?.role === "MODERATOR" || session?.user?.role === "ADMIN";
  const canEdit = isOwner; // Seul le propriétaire peut modifier
  const canDelete = isOwner || isModeratorOrAdmin; // Propriétaire OU modérateur/admin peuvent supprimer
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      return await MessageService.updateById(message.id, content);
    },
    onSuccess: () => {
      toast.success("Message modifié avec succès !");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la modification du message");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSave = () => {
    if (!editContent.trim()) {
      toast.error("Le contenu du message ne peut pas être vide");
      return;
    }
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate(editContent.trim());
  };

  return (
    <div className="border shadow-sm rounded-md p-8 relative">
      {(canEdit || canDelete) && !isEditing && (
        <div className="absolute top-2 right-2 flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <DeleteButton
              entityName="Message"
              queryKey="messages"
              onDelete={MessageService.deleteById}
              id={message.id}
              size="sm"
              className="h-8 w-8 p-0"
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {message.author && (
          <Link
            href={`/users/${message.author.id}`}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {message.author.name || message.author.email}
          </Link>
        )}
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={updateMutation.isPending}
              className="w-full"
            />
            <div className="flex gap-2 justify-end">
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
                  !editContent.trim() ||
                  editContent.trim() === message.content
                }
              >
                {updateMutation.isPending ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    </div>
  );
}
