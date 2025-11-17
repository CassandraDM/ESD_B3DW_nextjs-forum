import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getRelativeTime } from "@/lib/date";
import { ConversationWithExtend } from "@/types/conversation.type";
import Link from "next/link";

interface ConversationCardProps {
  conversation: ConversationWithExtend;
  isAuthenticated: boolean;
}

export default function ConversationCard({
  conversation,
  isAuthenticated,
}: ConversationCardProps) {
  return (
    <Link href={`/conversations/${conversation.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-all">
        <CardContent>{conversation?.title}</CardContent>
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
    </Link>
  );
}
