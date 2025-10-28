import { Message } from "@/generated/prisma";
import DeleteButton from "../common/DeleteButton";
import MessageService from "@/services/message.service";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="border shadow-sm rounded-md p-8 relative">
      <DeleteButton
        className="absolute top-2 right-2"
        entityName="Message"
        queryKey="messages"
        onDelete={MessageService.deleteById}
        id={message.id}
      />
      {message.content}
    </div>
  );
}
