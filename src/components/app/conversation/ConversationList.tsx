"use client";

import ConversationService from "@/services/conversation.service";
import { useEffect, useState } from "react";
import ConversationCard from "./ConversationCard";
import ConversationSkeleton from "./ConversationSkeleton";
import { ConversationWithExtend } from "@/types/conversation.type";
import { useSession } from "@/hooks/useSession";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info } from "lucide-react";

export default function ConversationList() {
  const [conversations, setConversations] = useState<ConversationWithExtend[]>(
    []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (isAuthenticated) {
      getAllConversations();
    }
  }, [isAuthenticated]);

  const getAllConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const data = await ConversationService.fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <ConversationSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto relative">
        <div className="flex flex-col gap-4">
          {/* Afficher des cards floues placeholder pour montrer qu'il y a du contenu */}
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="border rounded-lg p-4 blur-sm bg-muted/50">
                <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
                  <div className="h-4 w-32 bg-muted-foreground/20 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Alert
          variant="destructive"
          className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-10"
        >
          <Info />
          <AlertTitle>Authentification requise</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 mt-2">
            <p>Vous devez être connecté pour accéder aux conversations.</p>
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
    <div className="container mx-auto">
      {isLoadingConversations ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ConversationSkeleton key={i} />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <p>Aucune conversation disponible.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
