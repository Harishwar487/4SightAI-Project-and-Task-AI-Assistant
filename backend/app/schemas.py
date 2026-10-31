from pydantic import BaseModel
from datetime import date, datetime


# Authentication schemas

class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# Project schemas

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    manager_id: int | None = None

    class Config:
        from_attributes = True


# Task schemas

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "Pending"
    due_date: date | None = None
    project_id: int
    assignee_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    assignee_id: int | None = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str
    due_date: date | None = None
    project_id: int
    assignee_id: int | None = None

    class Config:
        from_attributes = True


from datetime import datetime


class TaskChangeResponse(BaseModel):
    id: int
    task_id: int
    proposed_status: str
    requested_by: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskChangeCreate(BaseModel):
    task_id: int
    proposed_status: str

# Chat and conversation schemas

class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None
    project_id: int | None = None


class ChatResponse(BaseModel):
    conversation_id: int
    answer: str
    proposed_change: dict | None = None


class ConversationResponse(BaseModel):
    id: int
    title: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    manager_id: int | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    manager_id: int | None = None
