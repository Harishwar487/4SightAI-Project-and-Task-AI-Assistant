
import { Link } from "react-router-dom";
import {
  FolderKanban,
  ArrowUpRight,
  CheckCircle2,
  ListTodo,
} from "lucide-react";

export default function ProjectCard({ project, tasks = [] }) {
  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  return (
    <div className="project-card">
      <div className="project-card-top">
        <div className="project-icon">
          <FolderKanban size={22} />
        </div>

        <span className="project-id">
          PROJECT #{project.id}
        </span>
      </div>

      <h3>{project.name}</h3>

      <p className="project-description">
        {project.description || "No project description available."}
      </p>

      <div className="project-progress-info">
        <span>Project Progress</span>
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
          <CheckCircle2 size={15} />
          {completedTasks} Completed
        </span>

        <span>
          <ListTodo size={15} />
          {totalTasks} Tasks
        </span>
      </div>

      <Link
        to={`/projects/${project.id}`}
        className="project-open-link"
      >
        View Project
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
