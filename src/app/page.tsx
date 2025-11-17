import Header from "@/components/app/common/Header";
import ConversationList from "@/components/app/conversation/ConversationList";
import ConversationForm from "@/components/app/conversation/ConversationForm";

export default function Home() {
  return (
    <>
      <Header />
      <div className="pt-4">
        <div className="container mx-auto px-4">
          <ConversationForm />
        </div>
        <ConversationList />
      </div>
    </>
  );
}
