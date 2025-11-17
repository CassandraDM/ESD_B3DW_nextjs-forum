"use client";

import ConversationService from "@/services/conversation.service";
import ConversationCard from "./ConversationCard";
import ConversationSkeleton from "./ConversationSkeleton";
import { ConversationWithExtend } from "@/types/conversation.type";
import { useSession } from "@/hooks/useSession";
import { useQuery } from "@tanstack/react-query";

export default function ConversationList() {
  const { isAuthenticated, isLoading } = useSession();

  const { data: conversations, isLoading: isLoadingConversations } = useQuery<
    ConversationWithExtend[]
  >({
    queryKey: ["conversations"],
    queryFn: async () => {
      return await ConversationService.fetchConversations();
    },
  });

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
        ) : !conversations || conversations.length === 0 ? (
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
      ) : !conversations || conversations.length === 0 ? (
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
