# 4SightAI – API Documentation

## 1. Introduction

The 4SightAI backend is developed using FastAPI. It provides REST API endpoints for authentication, project management, task management, AI conversations, and proposed task changes.

**Backend URL:** `http://127.0.0.1:8000`

**Interactive API Documentation:** `http://127.0.0.1:8000/docs`

## 2. Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate a user and obtain an access token |
| GET | `/auth/me` | Retrieve the logged-in user's information |

Authentication uses a JWT access token. Protected endpoints require a valid token.

## 3. Project APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/` | Retrieve projects accessible to the logged-in user |
| POST | `/projects/` | Create a project (admin permission required) |
| GET | `/projects/{project_id}` | Retrieve project details |
| PUT | `/projects/{project_id}` | Update project information (authorized roles only) |

Project access is filtered according to the user's role and project membership.

## 4. Task APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks/` | Retrieve accessible tasks |
| POST | `/tasks/` | Create a task in an authorized project |
| PUT | `/tasks/{task_id}` | Update an authorized task |
| GET | `/tasks/{task_id}` | Retrieve task details |

Regular users can change the status only of tasks assigned to them. Project managers and administrators have broader permissions according to their roles.

## 5. AI Chat API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/` | Send a message to the AI assistant |

The chat endpoint accepts the following information:

- `message`: User's question or instruction.
- `conversation_id`: Existing conversation ID for follow-up messages, when applicable.
- `project_id`: Selected project ID, when a single project is selected.

The response contains:

- `conversation_id`: Conversation identifier.
- `answer`: AI-generated response.
- `proposed_change`: Proposed task change, when applicable.

## 6. Conversation APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations/` | Retrieve the logged-in user's conversations |
| GET | `/conversations/{conversation_id}` | Retrieve messages from a conversation |

Conversation access is restricted to the user who owns the conversation.

## 7. Task Change APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/task-changes/{change_id}/confirm` | Confirm a proposed task change |
| POST | `/task-changes/{change_id}/cancel` | Cancel a proposed task change |

The backend checks authorization again before applying a confirmed change.

## 8. Authorization