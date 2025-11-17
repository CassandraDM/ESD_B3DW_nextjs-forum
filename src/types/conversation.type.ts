import { Conversation, Message } from "@/generated/prisma";

export interface ConversationWithExtend extends Conversation {
  messages: Message[];
  author?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}
