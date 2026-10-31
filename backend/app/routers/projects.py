from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Project, User
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.permission_service import get_accessible_project_ids

router = APIRouter(prefix="/projects", tags=["Projects"])


# Get all projects accessible to the logged-in user
@router.get("/", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_ids = get_accessible_project_ids(db, current_user)

    return db.query(Project).filter(Project.id.in_(project_ids)).all()


# Get one project
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project or project_id not in get_accessible_project_ids(db, current_user):
        raise HTTPException(status_code=404, detail="Project not found")

    return project


# Create a project (Admin only)
@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create projects")

    if project_data.manager_id is not None:
        manager = db.query(User).filter(User.id == project_data.manager_id).first()

        if not manager or manager.role.lower() != "manager":
            raise HTTPException(status_code=400, detail="Invalid project manager")

    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        manager_id=project_data.manager_id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# Update a project (Admin only)
@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only admins can edit projects")

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_data.model_dump(exclude_unset=True)

    if "manager_id" in update_data and update_data["manager_id"] is not None:
        manager = db.query(User).filter(User.id == update_data["manager_id"]).first()

        if not manager or manager.role.lower() != "manager":
            raise HTTPException(status_code=400, detail="Invalid project manager")

    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project