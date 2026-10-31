
from sqlalchemy.orm import Session

from app.models import User, Project, ProjectMember, Task


def get_accessible_project_ids(db: Session, user: User) -> list[int]:
    """
    Return project IDs that the logged-in user is allowed to access.
    """

    role = user.role.lower()

    # Admin can access every project
    if role == "admin":
        results = db.query(Project.id).all()
        return [row[0] for row in results]

    # Manager can access projects they manage
    if role == "manager":
        results = db.query(Project.id).filter(
            Project.manager_id == user.id
        ).all()
        return [row[0] for row in results]

    # Regular user can access projects they belong to
    if role == "user":
        results = db.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user.id
        ).all()
        return [row[0] for row in results]

    return []


def can_view_project(
    db: Session,
    user: User,
    project_id: int
) -> bool:
    accessible_ids = get_accessible_project_ids(db, user)
    return project_id in accessible_ids


def can_view_task(
    db: Session,
    user: User,
    task: Task
) -> bool:
    return can_view_project(db, user, task.project_id)


def can_edit_task(
    db: Session,
    user: User,
    task: Task
) -> bool:
    """
    Admin can edit every task.
    Manager can edit tasks in projects they manage.
    Regular users cannot edit task details.
    """

    role = user.role.lower()

    if role == "admin":
        return True

    if role == "manager":
        project = db.query(Project).filter(
            Project.id == task.project_id
        ).first()

        return project is not None and project.manager_id == user.id

    return False


def can_change_task_status(
    db: Session,
    user: User,
    task: Task
) -> bool:
    """
    Admin can change all task statuses.
    Manager can change statuses in managed projects.
    Regular users can change status only on their assigned tasks.
    """

    role = user.role.lower()

    if role == "admin":
        return True

    if role == "manager":
        return can_edit_task(db, user, task)

    if role == "user":
        return (
            task.assignee_id == user.id
            and can_view_task(db, user, task)
        )

    return False


def can_create_task_in_project(
    db: Session,
    user: User,
    project_id: int
) -> bool:
    """
    Admin can create tasks in all projects.
    Manager can create tasks only in projects they manage.
    Regular users cannot create tasks.
    """

    if user.role.lower() == "admin":
        return db.query(Project.id).filter(
            Project.id == project_id
        ).first() is not None

    if user.role.lower() == "manager":
        return db.query(Project.id).filter(
            Project.id == project_id,
            Project.manager_id == user.id
        ).first() is not None

    return False
