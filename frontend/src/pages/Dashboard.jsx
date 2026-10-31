
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  LogOut,
  CalendarDays,
  UserRound,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getProjects } from "../services/projectAPI";
import { getTasks } from "../services/taskAPI";

// Reusable statistics card
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>

      <div className="stat-details">
        <p>{label}</p>
        <h2>{value}</h2>
      </div>

      <ArrowUpRight className="stat-arrow" size={18} />
    </article>
  );
}

// Reusable status badge
function StatusBadge({ status }) {
  const statusClass = status?.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`status-badge ${statusClass}`}>
      {status || "Unknown"}
    </span>
  );
}

// Reusable project card
function ProjectCard({ project, tasks }) {
  const projectTasks = tasks.filter(
    (task) => task.project_id === project.id
  );

  const completed = projectTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const progress = projectTasks.length
    ? Math.round((completed / projectTasks.length) * 100)
    : 0;

  return (
    <article className="project-card">
      <div className="project-card-top">
        <div className="project-icon">
          <FolderKanban size={21} />
        </div>
        <span className="project-id">PROJECT #{project.id}</span>
      </div>

      <h3>{project.name}</h3>

      <p className="project-description">
        {project.description || "No project description available."}
      </p>

      <div className="project-progress-info">
        <span>Completion</span>
        <strong>{progress}%</strong>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="project-footer">
        <span>
          <ListTodo size={15} />
          {projectTasks.length} Tasks
        </span>

        <span>
          <CheckCircle2 size={15} />
          {completed} Completed
        </span>
      </div>
    </article>
  );
}

// Main dashboard
export default function Dashboard() {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dashboard data
  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectData, taskData] = await Promise.all([
          getProjects(),
          getTasks(),
        ]);

        if (isMounted) {
          setProjects(projectData);
          setTasks(taskData);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Unable to load dashboard data. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate dashboard statistics only when data changes
  const statistics = useMemo(() => {
    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const overdue = tasks.filter(
      (task) =>
        task.due_date &&
        task.due_date.slice(0, 10) < todayString &&
        task.status !== "Completed"
    ).length;

    return [
      {
        label: "Total Projects",
        value: projects.length,
        icon: FolderKanban,
        color: "purple",
      },
      {
        label: "Total Tasks",
        value: tasks.length,
        icon: ListTodo,
        color: "blue",
      },
      {
        label: "Completed",
        value: completed,
        icon: CheckCircle2,
        color: "green",
      },
      {
        label: "Pending",
        value: pending,
        icon: Clock,
        color: "orange",
      },
      {
        label: "In Progress",
        value: inProgress,
        icon: Activity,
        color: "cyan",
      },
      {
        label: "Overdue",
        value: overdue,
        icon: AlertCircle,
        color: "red",
      },
    ];
  }, [projects, tasks]);

  // Map project IDs to names for the task table
  const projectNames = useMemo(
    () =>
      new Map(projects.map((project) => [project.id, project.name])),
    [projects]
  );

  const navigation = [
    { label: "Dashboard", path: "/", icon: Activity, end: true },
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Tasks", path: "/tasks", icon: ListTodo },
    { label: "AI Assistant", path: "/ai-assistant", icon: Activity },
    {
      label: "Conversation History",
      path: "/conversations",
      icon: Clock,
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <FolderKanban size={24} />
          </div>

          <div>
            <h2>4SightAI</h2>
            <span>Workspace</span>
          </div>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.role || "Member"}</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="dashboard-main">

        {/* Top navigation */}
        <header className="dashboard-topbar">
          <div>
            <span className="topbar-label">
              WORKSPACE / OVERVIEW
            </span>
            <h2>Dashboard</h2>
          </div>

          <div className="topbar-profile">
            <div className="topbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{user?.name || "User"}</strong>
              <span>{user?.role || "Member"}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content">

          {/* Welcome section */}
          <section className="welcome-section">
            <div>
              <span className="welcome-tag">
                YOUR WORKSPACE
              </span>

              <h1>Welcome back, {user?.name || "User"}!</h1>

              <p>
                Here's an overview of the projects and tasks you are
                authorized to access.
              </p>
            </div>
          </section>

          {/* Loading and error states */}
          {loading && (
            <div className="dashboard-message">
              <div className="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Dashboard data */}
          {!loading && !error && (
            <>
              {/* Statistics */}
              <section className="stats-grid">
                {statistics.map((stat) => (
                  <StatCard
                    key={stat.label}
                    {...stat}
                  />
                ))}
              </section>

              {/* Projects */}
              <section className="content-section">
                <div className="section-heading">
                  <div>
                    <h2>Your Projects</h2>
                    <p>
                      Overview of your accessible projects
                    </p>
                  </div>

                  <span className="section-count">
                    {projects.length} Projects
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div className="empty-state">
                    No accessible projects found.
                  </div>
                ) : (
                  <div className="projects-grid">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        tasks={tasks}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Recent tasks */}
              <section className="content-section tasks-section">
                <div className="section-heading">
                  <div>
                    <h2>Recent Tasks</h2>
                    <p>
                      Tasks from your accessible projects
                    </p>
                  </div>

                  <span className="section-count">
                    {tasks.length} Tasks
                  </span>
                </div>

                {tasks.length === 0 ? (
                  <div className="empty-state">
                    No tasks found.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="tasks-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Project</th>
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

                            <td>
                              {projectNames.get(task.project_id) ||
                                `Project #${task.project_id}`}
                            </td>

                            <td>
                              <span className="assignee-label">
                                <UserRound size={15} />
                                {task.assignee_id ?? "Unassigned"}
                              </span>
                            </td>

                            <td>
                              <StatusBadge status={task.status} />
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
                  </div>
                )}
              </section>
            </>
          )}

          <footer className="dashboard-footer">
            4SightAI · Project and Task AI Assistant
          </footer>
        </main>
      </div>
    </div>
  );
}
