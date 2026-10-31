
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Bot,
  MessageSquare,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: ListTodo,
    },
    {
      name: "AI Assistant",
      path: "/ai-assistant",
      icon: Bot,
    },
    {
      name: "Conversations",
      path: "/conversations",
      icon: MessageSquare,
    },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Bot size={24} />
        </div>
        <div>
          <h2>4SightAI</h2>
          <p>Project Assistant</p>
        </div>
      </div>

      <p className="sidebar-section-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="sidebar-user-info">
            <strong>{user?.email || "User"}</strong>
            <span>{user?.role || "Member"}</span>
          </div>
        </div>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
