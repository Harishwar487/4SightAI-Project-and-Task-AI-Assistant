# 4SightAI – AI Design Documentation

## 1. Introduction

4SightAI is an AI-powered project and task management assistant. It uses a Generative AI model to understand user questions, retrieve relevant project information, summarize progress, and suggest task status changes.

The AI assistant is integrated with the FastAPI backend and uses the Gemini model.

## 2. AI Technology

- **AI Provider:** Google Gemini
- **Model:** Gemini 2.5 Flash
- **Backend:** Python and FastAPI
- **Database:** SQLite
- **Integration:** Google GenAI SDK

The API key is stored in the backend environment configuration and is not exposed to the frontend.

## 3. AI Assistant Workflow

1. The user logs into the application.
2. The user opens the AI Assistant.
3. The user selects a project or chooses all accessible projects.
4. The user enters a question.
5. The backend identifies the user's role and permissions.
6. The backend retrieves the permitted project and task information.
7. Relevant conversation history is included when available.
8. The AI model generates a response using the retrieved information.
9. The response is displayed in the frontend.

## 4. Project and Task Analysis

The AI assistant supports questions related to:

- Project progress and summaries.
- Task status and ownership.
- Pending and completed tasks.
- Overdue tasks.
- Project progress information.
- Tasks assigned to users.

The assistant uses current database information to answer questions instead of relying only on previously generated responses.

## 5. Role-Based AI Context

The backend filters project and task information according to the logged-in user's permissions.

- **Admin:** Can ask questions about all projects and tasks.
- **Project Manager:** Can ask questions about projects they manage.
- **Regular User:** Can ask questions about projects they belong to.

The AI assistant receives only the information the user is authorized to access.

## 6. AI-Proposed Task Changes

The assistant can suggest a task status change when requested.

The workflow is:

1. The user asks the AI to change a task status.
2. The backend checks whether the user has permission.
3. The AI assistant generates a proposed change.
4. The proposal is displayed for review.
5. The user can confirm or cancel the proposal.
6. If confirmed, the backend checks permissions again and updates the task.
7. If cancelled, the task remains unchanged.

This confirmation process prevents unintended task updates.

## 7. Conversation Management

The application stores conversations and messages in the database.

- Users can create separate conversations.
- Previous conversations can be accessed through conversation history.
- Follow-up questions use relevant conversation context.
- Conversations are associated with individual users.
- Project and task information is retrieved from the current database when answering questions.

## 8. Error Handling

The application handles AI service errors and unavailable model responses.

Temporary service failures are retried where supported. If the AI service remains unavailable, the backend returns an error rather than pretending a response was successfully generated.

## 9. Limitations

- AI responses depend on the quality of the available project and task data.
- External AI service availability can affect response generation.
- AI-generated summaries and suggestions should be reviewed by users.
- The application requires a valid Gemini API key.

## 10. Conclusion

The AI design combines Generative AI with database-driven project information and role-based authorization. It helps users understand project progress, review tasks, and request task changes while keeping final update decisions under user control.