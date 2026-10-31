
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

import { getProjectById } from "../services/projectAPI";
import { getTasks } from "../services/taskAPI";

function StatusBadge({ status }) {
  const normalizedStatus = (status || "Pending").toLowerCase();

  return (
    <span className={`status-badge ${normalizedStatus.replace(/\s+/g, "-")}`}>
      {status || "Pending"}
    </span>
  );
}

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProjectDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectData, taskData] = await Promise.all([
          getProjectById(projectId),
          getTasks(projectId),
        ]);

        if (isMounted) {
          setProject(projectData);
          setTasks(taskData);
        }
      } catch (err) {
        console.error("Error loading project details:", err);

        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Unable to load project details. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjectDetails();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "in progress"
  ).length;

  const completionPercentage =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-message">
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-message">
          <AlertCircle size={24} />
          <p>{error}</p>
          <Link to="/projects" className="project-open-link">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="dashboard-content">
        <div className="empty-state">
          <h3>Project not found</h3>
          <p>The requested project could not be found.</p>
          <Link to="/projects" className="project-open-link">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <Link to="/projects" className="project-open-link">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <div className="welcome-tag">
          <FolderKanban size={16} />
          Project Details
        </div>

        <h1>{project.name}</h1>

        <p>
          {project.description || "No project description available."}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ListTodo size={22} />
          </div>
          <div className="stat-details">
            <span>Total Tasks</span>
            <h2>{tasks.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-details">
            <span>Completed</span>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={22} />
          </div>
          <div className="stat-details">
            <span>Pending</span>
            <h2>{pendingTasks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FolderKanban size={22} />
          </div>
          <div className="stat-details">
            <span>In Progress</span>
            <h2>{inProgressTasks}</h2>
          </div>
        </div>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Project Progress</h2>
            <p>Overall task completion</p>
          </div>
          <strong>{completionPercentage}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Project Tasks</h2>
            <p>Tasks assigned to this project</p>
          </div>

          <span className="section-count">
            {tasks.length} Tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={30} />
            <h3>No tasks available</h3>
            <p>There are currently no tasks in this project.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-title">
                        <ListTodo size={16} />
                        {task.title}
                      </div>
                    </td>

                    <td>
                      {task.description || "No description"}
                    </td>

                    <td>
                      <StatusBadge status={task.status} />
                    </td>

                    <td>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "Not set"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
