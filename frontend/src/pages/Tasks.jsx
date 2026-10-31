import { useEffect, useState } from "react";
import { ListTodo, CalendarDays } from "lucide-react";
import { getTasks } from "../services/taskAPI";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) =>
        setError(err.response?.data?.detail || "Unable to load tasks.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dashboard-content">
      <div className="welcome-section">
        <div>
          <span className="welcome-tag">WORKSPACE</span>
          <h1>Tasks</h1>
          <p>View tasks belonging to projects you can access.</p>
        </div>
        <span className="section-count">{tasks.length} Tasks</span>
      </div>

      {loading && <div className="dashboard-message">Loading tasks...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project ID</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="task-title">
                      <div className="task-small-icon">
                        <ListTodo size={16} />
                      </div>
                      <strong>{task.title}</strong>
                    </div>
                  </td>
                  <td>#{task.project_id}</td>
                  <td>{task.assignee_id ?? "Unassigned"}</td>
                  <td>
                    <span className={`status-badge ${task.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span className="due-date">
                      <CalendarDays size={15} />
                      {task.due_date || "Not specified"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tasks.length === 0 && (
            <div className="empty-state">No tasks found.</div>
          )}
        </div>
      )}
    </main>
  );
}