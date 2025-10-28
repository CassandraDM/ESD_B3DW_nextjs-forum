interface FetchMessageParams {
  conversationId?: string;
}

export async function fetchMessages(params?: FetchMessageParams) {
  const queryParams = new URLSearchParams();

  if (params?.conversationId) {
    queryParams.append("conversationId", params.conversationId);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/messages?${queryString}` : "/api/messages";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

const MessageService = {
  fetchMessages,
};

export default MessageService;
