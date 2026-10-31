
import { useEffect, useState } from "react";
import { MessageSquare, Plus, Bot, Sparkles } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import Loading from "../components/Loading";

import {
  sendChatMessage,
  getConversations,
  getConversationMessages,
  confirmTaskChange,
  cancelTaskChange,
} from "../services/chatAPI";

import { getTasks } from "../services/taskAPI";
import { getProjects } from "../services/projectAPI";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [conversationId, setConversationId] = useState(null);
  const [proposedChange, setProposedChange] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssistantData = async () => {
      try {
        setPageLoading(true);
        setError("");

        const [conversationData, taskData, projectData] =
          await Promise.all([
            getConversations(),
            getTasks(),
            getProjects(),
          ]);

        setConversations(conversationData);
        setTasks(taskData);
        setProjects(projectData);
      } catch (err) {
        console.error("AI Assistant loading error:", err);
        setError(
          err.response?.data?.detail ||
            "Unable to load the AI Assistant."
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadAssistantData();
  }, []);

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setProposedChange(null);
    setError("");
  };

  const handleOpenConversation = async (id) => {
    try {
      setLoading(true);
      setError("");
      setProposedChange(null);

      const data = await getConversationMessages(id);

      setConversationId(id);
      setMessages(data);
    } catch (err) {
      console.error("Conversation loading error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to open this conversation."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      setLoading(true);
      setError("");
      setProposedChange(null);

      const response = await sendChatMessage(
        message,
        conversationId,
        selectedProjectId
          ? Number(selectedProjectId)
          : null
      );

      setConversationId(response.conversation_id);

      setMessages((previous) => [
        ...previous,
        { role: "user", content: message },
        { role: "assistant", content: response.answer },
      ]);

      if (response.proposed_change) {
        const change = response.proposed_change;

        const relatedTask = tasks.find(
          (task) => task.id === change.task_id
        );

        setProposedChange({
          ...change,
          task_title:
            relatedTask?.title || `Task #${change.task_id}`,
          changes: {
            status: change.proposed_status,
          },
        });
      }

      const updatedConversations = await getConversations();
      setConversations(updatedConversations);
    } catch (err) {
      console.error("AI message error:", err);
      setError(
        err.response?.data?.detail ||
          "The AI Assistant could not respond. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!proposedChange) return;

    try {
      setLoading(true);
      setError("");

      await confirmTaskChange(proposedChange.id);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "The proposed task change was confirmed successfully.",
        },
      ]);

      setProposedChange(null);

      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Confirmation error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to confirm the proposed change."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChange = async () => {
    if (!proposedChange) return;

    try {
      setLoading(true);
      setError("");

      await cancelTaskChange(proposedChange.id);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "The proposed task change was cancelled. The task was not modified.",
        },
      ]);

      setProposedChange(null);
    } catch (err) {
      console.error("Cancellation error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to cancel the proposed change."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Loading message="Loading AI Assistant..." />;
  }

  const selectedProject = projects.find(
    (project) => String(project.id) === selectedProjectId
  );

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <Navbar title="AI Assistant" />

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="welcome-tag">
                <Sparkles size={15} />
                AI WORKSPACE
              </span>

              <h1>AI Project Assistant</h1>

              <p>
                Your intelligent assistant for project insights,
                task updates, and progress tracking.
              </p>
            </div>
          </section>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <section className="ai-project-selector">
            <div>
              <h3>Project Context</h3>
              <p>
                Choose which project the AI assistant should use.
              </p>
            </div>

            <select
              value={selectedProjectId}
              onChange={(event) =>
                setSelectedProjectId(event.target.value)
              }
              disabled={loading}
            >
              <option value="">All Accessible Projects</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <p className="ai-scope-text">
              Current scope:{" "}
              <strong>
                {selectedProject
                  ? selectedProject.name
                  : "All accessible projects"}
              </strong>
            </p>
          </section>

          <section className="ai-assistant-layout">
            <aside className="conversation-sidebar">
              <button
                type="button"
                className="new-conversation-button"
                onClick={handleNewConversation}
                disabled={loading}
              >
                <Plus size={18} />
                New Conversation
              </button>

              <h3>Recent Conversations</h3>

              {conversations.length === 0 ? (
                <p className="conversation-empty">
                  No conversations yet.
                </p>
              ) : (
                <div className="conversation-list">
                  {conversations.map((conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      className={`conversation-item ${
                        conversationId === conversation.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleOpenConversation(conversation.id)
                      }
                      disabled={loading}
                    >
                      <MessageSquare size={16} />
                      <span>
                        {conversation.title || "Untitled Conversation"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <div className="ai-chat-area">
              <div className="ai-chat-heading">
                <div className="ai-chat-icon">
                  <Bot size={22} />
                </div>
                <div>
                  <h3>4SightAI Assistant</h3>
                  <p>Ask questions about your project and tasks</p>
                </div>
              </div>

              <ChatWindow
                messages={messages}
                onSend={handleSendMessage}
                loading={loading}
                proposedChange={proposedChange}
                onConfirmChange={handleConfirmChange}
                onCancelChange={handleCancelChange}
              />
            </div>
          </section>

          <footer className="dashboard-footer">
            4SightAI · Project and Task AI Assistant
          </footer>
        </div>
      </main>
    </div>
  );
}
