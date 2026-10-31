
import {
  ListTodo,
  CalendarDays,
  UserRound,
} from "lucide-react";

export default function TaskTable({ tasks = [], projectNames = {} }) {
  const getProjectName = (projectId) => {
    if (projectNames instanceof Map) {
      return projectNames.get(projectId) || `Project ${projectId}`;
    }

    return projectNames[projectId] || `Project ${projectId}`;
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <ListTodo size={30} />
        <h3>No tasks available</h3>
        <p>There are no tasks to display right now.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="tasks-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Project</th>
            <th>Assignee</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => {
            const status = task.status || "Pending";

            return (
              <tr key={task.id}>
                <td>
                  <div className="task-title">
                    <ListTodo size={16} />
                    {task.title}
                  </div>
                </td>

                <td>
                  {getProjectName(task.project_id)}
                </td>

                <td>
                  <span className="assignee-label">
                    <UserRound size={14} />
                    {task.assignee_id
                      ? `User ${task.assignee_id}`
                      : "Unassigned"}
                  </span>
                </td>

                <td>
                  <span className="due-date">
                    <CalendarDays size={14} />
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "Not set"}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge ${status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
