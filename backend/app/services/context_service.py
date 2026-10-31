
from datetime import date

from sqlalchemy.orm import Session

from app.models import User, Project, Task
from app.services.permission_service import get_accessible_project_ids


def build_user_context(
    db: Session,
    user: User,
    project_id: int | None = None
) -> dict:
    """
    Build AI context using only projects and tasks
    that the signed-in user is allowed to access.
    """

    # Step 1: Get projects accessible to this user
    accessible_project_ids = get_accessible_project_ids(db, user)

    # Step 2: Apply optional project-specific scope
    if project_id is not None:
        if project_id not in accessible_project_ids:
            raise PermissionError(
                "You do not have permission to access this project"
            )

        accessible_project_ids = [project_id]

    # Step 3: Get permitted projects
    projects = (
        db.query(Project)
        .filter(Project.id.in_(accessible_project_ids))
        .all()
    )

    # Step 4: Get tasks only from permitted projects
    tasks = (
        db.query(Task)
        .filter(Task.project_id.in_(accessible_project_ids))
        .all()
    )

    current_date = date.today()

    project_context = []

    # Step 5: Prepare project and task information
    for project in projects:

        project_tasks = [
            task for task in tasks
            if task.project_id == project.id
        ]

        total_tasks = len(project_tasks)

        completed_tasks = sum(
            1 for task in project_tasks
            if task.status.lower() == "completed"
        )

        pending_tasks = sum(
            1 for task in project_tasks
            if task.status.lower() == "pending"
        )

        in_progress_tasks = sum(
            1 for task in project_tasks
            if task.status.lower() == "in progress"
        )

        overdue_tasks = sum(
            1 for task in project_tasks
            if task.due_date is not None
            and task.due_date < current_date
            and task.status.lower() != "completed"
        )

        progress = (
            round((completed_tasks / total_tasks) * 100, 2)
            if total_tasks > 0
            else 0
        )

        task_records = []

        for task in project_tasks:
            task_records.append({
                "task_id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "due_date": (
                    task.due_date.isoformat()
                    if task.due_date
                    else None
                ),
                "assignee_id": task.assignee_id,
                "assignee_name": (
                    task.assignee.name
                    if task.assignee
                    else "Unassigned"
                ),
                "is_overdue": (
                    task.due_date is not None
                    and task.due_date < current_date
                    and task.status.lower() != "completed"
                )
            })

        project_context.append({
            "project_id": project.id,
            "project_name": project.name,
            "description": project.description,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "overdue_tasks": overdue_tasks,
            "progress_percentage": progress,
            "tasks": task_records
        })

    # Step 6: Return structured context for the AI
    return {
        "user_id": user.id,
        "user_role": user.role,
        "current_date": current_date.isoformat(),
        "scope": (
            f"Project ID {project_id}"
            if project_id is not None
            else "All accessible projects"
        ),
        "total_projects": len(project_context),
        "projects": project_context
    }
