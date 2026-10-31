
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Task, TaskChange
from app.dependencies import get_current_user
from app.schemas import TaskChangeCreate, TaskChangeResponse
from app.services.permission_service import can_change_task_status

router = APIRouter(
    prefix="/task-changes",
    tags=["Task Changes"]
)


# Create a pending task change proposal
@router.post("/", response_model=TaskChangeResponse, status_code=201)
def create_task_change(
    change_data: TaskChangeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == change_data.task_id
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

    if change_data.proposed_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid proposed task status"
        )

    proposal = TaskChange(
        task_id=task.id,
        proposed_status=change_data.proposed_status,
        requested_by=current_user.id,
        status="Pending"
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return proposal


# CONFIRM a proposed task change
@router.post("/{change_id}/confirm", response_model=TaskChangeResponse)
def confirm_task_change(
    change_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(TaskChange).filter(
        TaskChange.id == change_id,
        TaskChange.requested_by == current_user.id
    ).first()

    if proposal is None:
        raise HTTPException(
            status_code=404,
            detail="Task change proposal not found"
        )

    if proposal.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="This proposal has already been processed"
        )

    task = db.query(Task).filter(
        Task.id == proposal.task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Check permissions again before applying the change
    if not can_change_task_status(db, current_user, task):
        raise HTTPException(
            status_code=403,
            detail="You no longer have permission to change this task"
        )

    task.status = proposal.proposed_status
    proposal.status = "Approved"

    db.commit()
    db.refresh(proposal)

    return proposal


# CANCEL a proposed task change
@router.post("/{change_id}/cancel", response_model=TaskChangeResponse)
def cancel_task_change(
    change_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(TaskChange).filter(
        TaskChange.id == change_id,
        TaskChange.requested_by == current_user.id
    ).first()

    if proposal is None:
        raise HTTPException(
            status_code=404,
            detail="Task change proposal not found"
        )

    if proposal.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending proposals can be cancelled"
        )

    proposal.status = "Cancelled"

    db.commit()
    db.refresh(proposal)

    return proposal

