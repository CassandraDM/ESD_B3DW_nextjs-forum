"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getRelativeTime } from "@/lib/date";
import { ConversationWithExtend } from "@/types/conversation.type";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import ConversationDeleteButton from "./ConversationDeleteButton";
import { useState } from "react";
import AuthDialog from "@/components/app/common/AuthDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, X, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import ConversationService from "@/services/conversation.service";

interface ConversationCardProps {
  conversation: ConversationWithExtend;
  isAuthenticated: boolean;
}

export default function ConversationCard({
  conversation,
  isAuthenticated,
}: ConversationCardProps) {
  const { session } = useSession();
  const router = useRouter();
  const isOwner = session?.user?.id === conversation.authorId;
  const [dialogOpen, setDialogOpen] = useState(false);
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
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la modification de la conversation"
      );
    },
  });

  const handleCardClick = (e: React.MouseEvent) => {
    // Ne pas naviguer si on clique sur le lien de l'auteur ou les boutons
    const target = e.target as HTMLElement;
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    if (!isAuthenticated) {
      setDialogOpen(true);
      return;
    }
    if (isEditing) {
      return;
    }
    router.push(`/conversations/${conversation.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(conversation.title || "");
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(conversation.title || "");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const cardContent = (
    <Card
      className={`${
        !isEditing ? "cursor-pointer hover:shadow-md" : ""
      } transition-all`}
      onClick={handleCardClick}
    >
      <CardContent>
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <Input
              value={editTitle || ""}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={updateMutation.isPending}
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            />
          ) : (
            <div>{conversation?.title}</div>
          )}
          {conversation?.author && (
            <Link
              href={`/users/${conversation.author.id}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Par {conversation.author.name || conversation.author.email}
            </Link>
          )}
        </div>
      </CardContent>
      <CardFooter className="w-full flex justify-between ">
        <p className="text-sm italic text-zinc-500">
          {getRelativeTime(conversation.createdAt)}
        </p>
        <p className="text-sm italic text-zinc-500">
          {conversation?.messages.length > 0
            ? `Nombre de réponses : ${conversation?.messages.length}`
            : "Aucune réponse"}
        </p>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div className="relative">
        <div onClick={handleCardClick}>{cardContent}</div>
        {isAuthenticated && isOwner && (
          <div
            className="absolute top-2 right-2 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
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
                <ConversationDeleteButton
                  id={conversation.id}
                  className="h-8 w-8 p-0"
                />
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
      {!isAuthenticated && (
        <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </>
  );
}
