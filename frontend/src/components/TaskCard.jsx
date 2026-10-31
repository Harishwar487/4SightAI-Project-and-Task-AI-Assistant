
import {
  CheckCircle2,
  Clock,
  Circle,
  CalendarDays,
  UserRound,
} from "lucide-react";

export default function TaskCard({ task }) {
  const status = task.status || "Pending";

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 size={16} />;

      case "in progress":
        return <Clock size={16} />;

      default:
        return <Circle size={16} />;
    }
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3>{task.title}</h3>

        <span
          className={`status-badge ${status
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {getStatusIcon()}
          {status}
        </span>
      </div>

      <p>
        {task.description || "No task description available."}
      </p>

      <div className="task-card-footer">
        <span>
          <CalendarDays size={15} />
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString()
            : "No due date"}
        </span>

        <span>
          <UserRound size={15} />
          {task.assignee_id
            ? `User ${task.assignee_id}`
            : "Unassigned"}
        </span>
      </div>
    </div>
  );
}
