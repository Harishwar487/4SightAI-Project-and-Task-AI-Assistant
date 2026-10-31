
import { Bell, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title = "Dashboard" }) {
  const { user } = useAuth();

  return (
    <header className="dashboard-topbar">
      <div>
        <span className="topbar-label">WORKSPACE</span>
        <h2>{title}</h2>
      </div>

      <div className="topbar-profile">
        <button
          type="button"
          className="navbar-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="topbar-avatar">
          <UserRound size={20} />
        </div>

        <div>
          <strong>{user?.email || "User"}</strong>
          <span>{user?.role || "Member"}</span>
        </div>
      </div>
    </header>
  );
}
