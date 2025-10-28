import { Message } from "@/generated/prisma";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="border shadow-sm rounded-md p-8">{message.content}</div>
  );
}
