"use client";

import ConversationService from "@/services/conversation.service";
import { useEffect, useState } from "react";
import ConversationCard from "./ConversationCard";
import ConversationSkeleton from "./ConversationSkeleton";
import { ConversationWithExtend } from "@/types/conversation.type";
import { useSession } from "@/hooks/useSession";

export default function ConversationList() {
  const [conversations, setConversations] = useState<ConversationWithExtend[]>(
    []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    getAllConversations();
  }, []);

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
      <div className="container mx-auto">
        {isLoadingConversations ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucune conversation disponible.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Afficher les vraies conversations */}
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isAuthenticated={false}
              />
            ))}
          </div>
        )}
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
