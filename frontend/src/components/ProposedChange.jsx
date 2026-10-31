
import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function ProposedChange({
  change,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!change) return null;

  const taskTitle =
    change.task_title ||
    change.title ||
    `Task #${change.task_id || ""}`;

  const changes =
    change.proposed_changes ||
    change.changes ||
    {};

  const currentStatus =
    change.current_status ||
    change.old_status ||
    change.previous_status ||
    change.task_status;

  const proposedStatus = changes.status;

  const otherChanges = Object.entries(changes).filter(
    ([field]) => field !== "status"
  );

  return (
    <div className="proposed-change-card">
      <div className="proposed-change-header">
        <div className="proposed-change-heading">
          <div className="proposed-change-icon">
            <ClipboardList size={22} />
          </div>

          <div>
            <h3>AI Proposed Task Change</h3>
            <p>Review the suggested changes before applying them.</p>
          </div>
        </div>

        <span className="proposed-change-badge">
          <AlertCircle size={15} />
          Pending Review
        </span>
      </div>

      <div className="proposed-change-task">
        <span className="proposed-section-label">TASK</span>
        <h4>{taskTitle}</h4>

        {change.task_id && (
          <span className="proposed-task-id">
            Task ID: #{change.task_id}
          </span>
        )}
      </div>

      <div className="proposed-change-details">
        <span className="proposed-section-label">
          PROPOSED CHANGES
        </span>

        {proposedStatus !== undefined && (
          <div className="status-change">
            <div className="status-item">
              <span>Current Status</span>
              <strong>
                {currentStatus || "Not available"}
              </strong>
            </div>

            <ArrowRight
              size={20}
              className="status-arrow"
            />

            <div className="status-item">
              <span>New Status</span>
              <strong className="new-status">
                {String(proposedStatus)}
              </strong>
            </div>
          </div>
        )}

        {otherChanges.map(([field, value]) => (
          <div className="proposed-change-row" key={field}>
            <span>{field.replace(/_/g, " ")}</span>
            <strong>
              {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value)}
            </strong>
          </div>
        ))}

        {Object.keys(changes).length === 0 && (
          <p>
            {change.description || "No change details available."}
          </p>
        )}
      </div>

      <div className="proposed-change-footer">
        <p>
          Please confirm only if you want to apply this change.
        </p>

        <div className="proposed-change-actions">
          <button
            type="button"
            className="confirm-change-button"
            onClick={onConfirm}
            disabled={loading}
          >
            <CheckCircle2 size={17} />
            {loading ? "Processing..." : "Confirm Changes"}
          </button>

          <button
            type="button"
            className="cancel-change-button"
            onClick={onCancel}
            disabled={loading}
          >
            <XCircle size={17} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
