
import { Bot, UserRound, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-message ${isUser ? "user-message" : "assistant-message"}`}>
      <div className={`chat-message-avatar ${isUser ? "user-avatar-style" : "ai-avatar-style"}`}>
        {isUser ? <UserRound size={18} /> : <Bot size={19} />}
      </div>

      <div className="chat-message-content">
        <div className="chat-message-heading">
          <strong>{isUser ? "You" : "4SightAI"}</strong>
          {!isUser && (
            <span className="ai-response-label">
              <Sparkles size={12} />
              AI Response
            </span>
          )}
        </div>

        <div className="chat-message-text">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h3>{children}</h3>,
              h2: ({ children }) => <h3>{children}</h3>,
              h3: ({ children }) => <h4>{children}</h4>,
              p: ({ children }) => <p>{children}</p>,
              ol: ({ children }) => <ol className="ai-task-list">{children}</ol>,
              ul: ({ children }) => <ul className="ai-task-details">{children}</ul>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong>{children}</strong>,
              code: ({ children }) => <code>{children}</code>,
            }}
          >
            {message.content || ""}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
