async function fetchConversations() {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
}

async function fetchConversationById(id: string) {
  const response = await fetch(`/api/conversations/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }
  return response.json();
}

const ConversationService = {
  fetchConversations,
  fetchConversationById,
};

export default ConversationService;
