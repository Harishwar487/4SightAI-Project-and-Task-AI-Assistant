
import { useEffect, useState } from "react";
import { MessageSquare, Clock } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatMessage from "../components/ChatMessage";
import Loading from "../components/Loading";

import {
  getConversations,
  getConversationMessages,
} from "../services/chatAPI";

export default function ConversationHistory() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState("");

  // Load previous conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setPageLoading(true);
        setError("");

        const data = await getConversations();

        setConversations(
          Array.isArray(data) ? data : data.conversations || []
        );
      } catch (err) {
        console.error("Conversation loading error:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load conversation history."
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Open a conversation and load its messages
  const handleOpenConversation = async (conversation) => {
    try {
      setMessageLoading(true);
      setError("");
      setSelectedConversation(conversation);
      setMessages([]);

      const data = await getConversationMessages(conversation.id);

      setMessages(
        Array.isArray(data) ? data : data.messages || []
      );
    } catch (err) {
      console.error("Message loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load messages."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  if (pageLoading) {
    return <Loading message="Loading conversation history..." />;
  }

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <Navbar title="Conversation History" />

        <div className="dashboard-content">
          <div className="welcome-section">
            <div className="welcome-tag">
              <Clock size={16} />
              SAVED CONVERSATIONS
            </div>

            <h1>Conversation History</h1>

            <p>
              View and continue reviewing your previous AI
              assistant conversations.
            </p>
          </div>

          {error && (
            <div className="dashboard-message">
              {error}
            </div>
          )}

          <div className="ai-assistant-layout">
            <aside className="conversation-sidebar">
              <h3>Previous Conversations</h3>

              {conversations.length === 0 ? (
                <p className="conversation-empty">
                  No previous conversations found.
                </p>
              ) : (
                <div className="conversation-list">
                  {conversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      className={`conversation-item ${
                        selectedConversation?.id === conversation.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleOpenConversation(conversation)
                      }
                      disabled={messageLoading}
                    >
                      <MessageSquare size={16} />

                      <span>
                        {conversation.title ||
                          "Untitled Conversation"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="ai-chat-area">
              {!selectedConversation ? (
                <div className="empty-state">
                  <MessageSquare size={36} />

                  <h3>Select a Conversation</h3>

                  <p>
                    Choose a previous conversation to view
                    its messages.
                  </p>
                </div>
              ) : messageLoading ? (
                <Loading message="Loading messages..." />
              ) : (
                <div className="history-messages">
                  <h2>
                    {selectedConversation.title ||
                      "Untitled Conversation"}
                  </h2>

                  {messages.length === 0 ? (
                    <p>No messages found in this conversation.</p>
                  ) : (
                    messages.map((message, index) => (
                      <ChatMessage
                        key={message.id || index}
                        message={message}
                      />
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
