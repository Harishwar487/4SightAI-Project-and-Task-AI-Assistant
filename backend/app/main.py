from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    projects,
    tasks,
    task_changes,
    chat,
    conversations
)

app = FastAPI(
    title="4SightAI Project and Task AI Assistant",
    description="Role-Based Project and Task Management with AI Assistant",
    version="1.0.0"
)

# Allow the React development server to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(task_changes.router)
app.include_router(chat.router)
app.include_router(conversations.router)


@app.get("/")
def home():
    return {
        "message": "4SightAI Backend is Running Successfully"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
