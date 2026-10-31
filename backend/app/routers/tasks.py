
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import TaskUpdate
from app.services.permission_service import can_edit_task
from app.database import get_db
from app.models import User, Task, Project
from app.dependencies import get_current_user
from app.schemas import TaskResponse, TaskCreate, TaskUpdate, TaskStatusUpdate
from app.services.permission_service import (
    get_accessible_project_ids,
    can_create_task_in_project,
    can_edit_task,
    can_change_task_status
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# GET all tasks accessible to the logged-in user
@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accessible_project_ids = get_accessible_project_ids(
        db, current_user
    )

    query = db.query(Task).filter(
        Task.project_id.in_(accessible_project_ids)
    )

    if project_id is not None:
        if project_id not in accessible_project_ids:
            raise HTTPException(
                status_code=404,
                detail="Project not found or you do not have permission to access it"
            )

        query = query.filter(Task.project_id == project_id)

    return query.all()


# GET a single task by its ID
@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accessible_project_ids = get_accessible_project_ids(
        db, current_user
    )

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id.in_(accessible_project_ids)
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found or you do not have permission to access it"
        )

    return task


# CREATE a new task
@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == task_data.project_id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if not can_create_task_in_project(
        db, current_user, task_data.project_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to create tasks in this project"
        )

    if task_data.assignee_id is not None:
        assignee = db.query(User).filter(
            User.id == task_data.assignee_id
        ).first()

        if assignee is None:
            raise HTTPException(
                status_code=404,
                detail="Assignee not found"
            )

    if task_data.status not in [
        "Pending",
        "In Progress",
        "Completed"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid task status"
        )

    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        due_date=task_data.due_date,
        project_id=task_data.project_id,
        assignee_id=task_data.assignee_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# UPDATE task details
@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if not can_edit_task(db, current_user, task):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to edit this task"
        )

    update_data = task_data.model_dump(exclude_unset=True)

    if "assignee_id" in update_data and update_data["assignee_id"] is not None:
        assignee = db.query(User).filter(
            User.id == update_data["assignee_id"]
        ).first()

        if assignee is None:
            raise HTTPException(
                status_code=404,
                detail="Assignee not found"
            )

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


# UPDATE task status
@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if not can_change_task_status(db, current_user, task):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to change this task status"
        )

    allowed_statuses = ["Pending", "In Progress", "Completed"]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid task status"
        )

    task.status = status_data.status

    db.commit()
    db.refresh(task)

    return task



