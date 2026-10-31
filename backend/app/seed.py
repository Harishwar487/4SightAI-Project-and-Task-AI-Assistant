
from datetime import date, timedelta

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import SessionLocal, Base, engine
from app.models import User, Project, ProjectMember, Task

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_database():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # Avoid inserting duplicate sample data
        if db.query(User).first():
            print("Database already contains data. Skipping seed.")
            return

        # 1. Create demo users
        admin = User(
            name="Admin User",
            email="admin@example.com",
            password=pwd_context.hash("Admin@123"),
            role="admin"
        )

        manager = User(
            name="Project Manager",
            email="manager@example.com",
            password=pwd_context.hash("Manager@123"),
            role="manager"
        )

        user1 = User(
            name="Regular User One",
            email="user1@example.com",
            password=pwd_context.hash("User1@123"),
            role="user"
        )

        user2 = User(
            name="Regular User Two",
            email="user2@example.com",
            password=pwd_context.hash("User2@123"),
            role="user"
        )

        db.add_all([admin, manager, user1, user2])
        db.flush()

        # 2. Create three projects
        project1 = Project(
            name="Website Redesign",
            description="Redesign the company website.",
            manager_id=manager.id
        )

        project2 = Project(
            name="AI Assistant Development",
            description="Develop an AI-powered task assistant.",
            manager_id=manager.id
        )

        project3 = Project(
            name="Data Analytics Dashboard",
            description="Build a business analytics dashboard.",
            manager_id=None
        )

        db.add_all([project1, project2, project3])
        db.flush()

        # 3. Create project memberships
        memberships = [
            ProjectMember(user_id=manager.id, project_id=project1.id),
            ProjectMember(user_id=manager.id, project_id=project2.id),

            ProjectMember(user_id=user1.id, project_id=project1.id),
            ProjectMember(user_id=user1.id, project_id=project2.id),

            ProjectMember(user_id=user2.id, project_id=project2.id),
            ProjectMember(user_id=user2.id, project_id=project3.id)
        ]

        db.add_all(memberships)

        # 4. Create twelve tasks with different statuses and due dates
        today = date.today()

        tasks = [
            Task(title="Design homepage", project_id=project1.id,
                 assignee_id=user1.id, status="In Progress",
                 due_date=today + timedelta(days=5)),

            Task(title="Create navigation menu", project_id=project1.id,
                 assignee_id=user1.id, status="Pending",
                 due_date=today - timedelta(days=3)),

            Task(title="Update website content", project_id=project1.id,
                 assignee_id=manager.id, status="Completed",
                 due_date=today - timedelta(days=5)),

            Task(title="Test mobile responsiveness", project_id=project1.id,
                 assignee_id=user1.id, status="Pending",
                 due_date=today + timedelta(days=7)),

            Task(title="Design AI chat interface", project_id=project2.id,
                 assignee_id=user2.id, status="In Progress",
                 due_date=today + timedelta(days=3)),

            Task(title="Develop chatbot API", project_id=project2.id,
                 assignee_id=user1.id, status="Pending",
                 due_date=today - timedelta(days=2)),

            Task(title="Integrate language model", project_id=project2.id,
                 assignee_id=manager.id, status="Completed",
                 due_date=today - timedelta(days=1)),

            Task(title="Test AI responses", project_id=project2.id,
                 assignee_id=user2.id, status="Pending",
                 due_date=today + timedelta(days=10)),

            Task(title="Prepare dashboard layout", project_id=project3.id,
                 assignee_id=user2.id, status="In Progress",
                 due_date=today + timedelta(days=4)),

            Task(title="Create sales charts", project_id=project3.id,
                 assignee_id=user2.id, status="Pending",
                 due_date=today - timedelta(days=4)),

            Task(title="Connect analytics database", project_id=project3.id,
                 assignee_id=admin.id, status="Completed",
                 due_date=today - timedelta(days=6)),

            Task(title="Validate dashboard reports", project_id=project3.id,
                 assignee_id=user2.id, status="Pending",
                 due_date=today + timedelta(days=14))
        ]

        db.add_all(tasks)
        db.commit()

        print("SUCCESS: Sample data inserted!")
        print("Users: 4")
        print("Projects: 3")
        print("Tasks: 12")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
