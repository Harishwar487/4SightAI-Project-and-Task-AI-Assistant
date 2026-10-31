
import { useState } from "react";
import {
  Send,
  Bot,
  Sparkles,
  FolderKanban,
  ListTodo,
  TrendingUp,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

import ChatMessage from "./ChatMessage";
import Loading from "./Loading";
import ProposedChange from "./ProposedChange";

export default function ChatWindow({
  messages = [],
  onSend,
  loading = false,
  proposedChange = null,
  onConfirmChange,
  onCancelChange,
}) {
  const [input, setInput] = useState("");

  const suggestions = [
    {
      icon: <ListTodo size={18} />,
      title: "Show my tasks",
      description: "View project tasks and their status",
      prompt: "Give me the tasks",
    },
    {
      icon: <FolderKanban size={18} />,
      title: "Project overview",
      description: "Get a summary of project progress",
      prompt: "Give me a summary of all my accessible projects",
    },
    {
      icon: <Clock3 size={18} />,
      title: "Pending work",
      description: "Find pending and overdue tasks",
      prompt: "Show me all pending and overdue tasks",
    },
    {
      icon: <TrendingUp size={18} />,
      title: "Project progress",
      description: "Check project completion progress",
      prompt: "What is the progress of my projects?",
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading || !onSend) {
      return;
    }

    onSend(message);
    setInput("");
  };

  const handleSuggestion = (prompt) => {
    if (!loading && onSend) {
      onSend(prompt);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-header-icon">
          <Bot size={22} />
        </div>

        <div className="chat-header-info">
          <h2>4SightAI Assistant</h2>
          <p>
            <span className="chat-online-dot" />
            AI Project Assistant
          </p>
        </div>

        <div className="chat-header-status">
          <span className="chat-status-dot" />
          Ready
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <Sparkles size={29} />
            </div>

            <span className="chat-welcome-label">
              YOUR AI WORKSPACE
            </span>

            <h3>How can I help you today?</h3>

            <p>
              Ask questions about your projects, tasks, progress,
              team activities, and pending work.
            </p>

            <div className="chat-suggestions">
              {suggestions.map((item) => (
                <button
                  type="button"
                  className="chat-suggestion-card"
                  key={item.title}
                  onClick={() => handleSuggestion(item.prompt)}
                  disabled={loading}
                >
                  <span className="suggestion-icon">
                    {item.icon}
                  </span>

                  <span className="suggestion-content">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>

                  <ArrowUpRight size={16} className="suggestion-arrow" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              message={message}
            />
          ))
        )}

        {loading && (
          <Loading message="4SightAI is analyzing your project..." />
        )}

        {proposedChange && (
          <ProposedChange
            change={proposedChange}
            onConfirm={onConfirmChange}
            onCancel={onCancelChange}
            loading={loading}
          />
        )}
      </div>

      <div className="chat-composer-area">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Message 4SightAI about your projects..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading || !onSend}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>

        <p className="chat-disclaimer">
          <Sparkles size={12} />
          AI can make mistakes. Review important task changes before confirming.
        </p>
      </div>
    </div>
  );
}
