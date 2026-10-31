
import { useEffect, useState } from "react";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Plus,
  Pencil,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProjects,
  createProject,
  updateProject
} from "../services/projectAPI";
import { getTasks } from "../services/taskAPI";

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager_id: ""
  });

  const loadData = async () => {
    try {
      const [projectData, taskData] = await Promise.all([
        getProjects(),
        getTasks()
      ]);
      setProjects(projectData);
      setTasks(taskData);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateForm = () => {
    setEditingProject(null);
    setForm({ name: "", description: "", manager_id: "" });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setForm({
      name: project.name || "",
      description: project.description || "",
      manager_id: project.manager_id ?? ""
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setForm({ name: "", description: "", manager_id: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const projectData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      manager_id: form.manager_id === ""
        ? null
        : Number(form.manager_id)
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await createProject(projectData);
      }

      closeForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save the project."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard-content">
      <div className="welcome-section">
        <div>
          <span className="welcome-tag">WORKSPACE</span>
          <h1>Projects</h1>
          <p>View the projects you are authorized to access.</p>
        </div>

        <div>
          <span className="section-count">
            {projects.length} Projects
          </span>

          {isAdmin && (
            <button
              type="button"
              className="project-open-link"
              onClick={openCreateForm}
            >
              <Plus size={16} /> Create Project
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && isAdmin && (
        <section className="project-card">
          <div className="project-card-top">
            <h3>
              {editingProject ? "Edit Project" : "Create New Project"}
            </h3>
            <button type="button" onClick={closeForm}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Project Name
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Enter project name"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Enter project description"
                rows={3}
              />
            </label>

            <label>
              Manager ID (optional)
              <input
                type="number"
                min="1"
                value={form.manager_id}
                onChange={(event) =>
                  setForm({ ...form, manager_id: event.target.value })
                }
                placeholder="Enter an existing manager's user ID"
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingProject
                  ? "Save Changes"
                  : "Create Project"}
            </button>

            <button type="button" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
          </form>
        </section>
      )}

      {loading && (
        <div className="dashboard-message">Loading projects...</div>
      )}

      {!loading && (
        <div className="projects-grid">
          {projects.map((project) => {
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
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <div className="project-icon">
                    <FolderKanban size={21} />
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
                    <ListTodo size={15} /> {projectTasks.length} Tasks
                  </span>
                  <span>
                    <CheckCircle2 size={15} /> {completed} Completed
                  </span>
                </div>

                <Link
                  className="project-open-link"
                  to={`/projects/${project.id}`}
                >
                  View project details →
                </Link>

                {isAdmin && (
                  <button
                    type="button"
                    className="project-open-link"
                    onClick={() => openEditForm(project)}
                  >
                    <Pencil size={15} /> Edit Project
                  </button>
                )}
              </article>
            );
          })}

          {projects.length === 0 && (
            <div className="empty-state">
              No accessible projects found.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
