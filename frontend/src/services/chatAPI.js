
import api from "./api";

// Send a message to the AI assistant
export const sendChatMessage = async (
  message,
  conversationId = null,
  projectId = null
) => {
  const response = await api.post("/chat/", {
    message,
    conversation_id: conversationId,
    project_id: projectId,
  });

  return response.data;
};

// Get all conversations belonging to the logged-in user
export const getConversations = async () => {
  const response = await api.get("/conversations/");
  return response.data;
};

// Get messages from a specific conversation
export const getConversationMessages = async (conversationId) => {
  const response = await api.get(
    `/conversations/${conversationId}/messages`
  );

  return response.data;
};

// Confirm an AI-proposed task change
export const confirmTaskChange = async (changeId) => {
  const response = await api.post(
    `/task-changes/${changeId}/confirm`
  );

  return response.data;
};

// Cancel an AI-proposed task change
export const cancelTaskChange = async (changeId) => {
  const response = await api.post(
    `/task-changes/${changeId}/cancel`
  );

  return response.data;
};
