import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from passlib.context import CryptContext

BACKEND_PATH = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_PATH))

from app.main import app
from app.database import Base, get_db
from app.models import User, Project, ProjectMember

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    admin = User(
        name="Test Admin",
        email="admin@example.com",
        password=pwd_context.hash("Admin@123"),
        role="admin",
    )

    manager = User(
        name="Test Manager",
        email="manager@example.com",
        password=pwd_context.hash("Manager@123"),
        role="manager",
    )

    user1 = User(
        name="Test User One",
        email="user1@example.com",
        password=pwd_context.hash("User1@123"),
        role="user",
    )

    user2 = User(
        name="Test User Two",
        email="user2@example.com",
        password=pwd_context.hash("User2@123"),
        role="user",
    )

    db.add_all([admin, manager, user1, user2])
    db.commit()

    db.refresh(manager)
    db.refresh(user1)
    db.refresh(user2)

    project1 = Project(
        name="Test Project One",
        description="First test project",
        manager_id=manager.id,
    )

    project2 = Project(
        name="Test Project Two",
        description="Second test project",
        manager_id=manager.id,
    )

    project3 = Project(
        name="Test Project Three",
        description="Third test project",
        manager_id=None,
    )

    db.add_all([project1, project2, project3])
    db.commit()

    db.refresh(project1)
    db.refresh(project2)
    db.refresh(project3)

    memberships = [
        ProjectMember(user_id=manager.id, project_id=project1.id),
        ProjectMember(user_id=manager.id, project_id=project2.id),
        ProjectMember(user_id=user1.id, project_id=project1.id),
        ProjectMember(user_id=user2.id, project_id=project2.id),
    ]

    db.add_all(memberships)
    db.commit()
    db.close()

    def override_get_db():
        test_db = TestingSessionLocal()
        try:
            yield test_db
        finally:
            test_db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
