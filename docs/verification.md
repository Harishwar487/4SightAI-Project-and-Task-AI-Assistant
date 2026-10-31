# 4SightAI – Verification and Testing Documentation

## 1. Introduction

This document describes the testing and verification process for the 4SightAI application. The purpose is to check that the application works correctly and follows the assignment requirements.

## 2. Testing Environment

- Frontend: React and Vite
- Backend: Python and FastAPI
- Database: SQLite
- AI Model: Google Gemini 2.5 Flash
- API Testing: FastAPI Swagger UI
- Backend Testing: Python and Pytest

## 3. Authentication Testing

| Test Case | Expected Result |
|---|---|
| Login with valid admin credentials | Admin login succeeds |
| Login with valid manager credentials | Manager login succeeds |
| Login with valid regular user credentials | User login succeeds |
| Login with incorrect password | Login is rejected |
| Access protected API without token | Request is rejected |

## 4. Role-Based Access Testing

| Test Case | Expected Result |
|---|---|
| Admin views all projects | All projects are accessible |
| Manager views managed projects | Only managed projects are accessible |
| Regular user views projects | Only member projects are accessible |
| Regular user accesses an unrelated project | Access is denied |
| Regular user updates an assigned task | Authorized status update is allowed |
| Regular user updates another user's task | Update is denied |

## 5. Project and Task Testing

| Test Case | Expected Result |
|---|---|
| Retrieve project details | Correct project information is displayed |
| Retrieve project tasks | Correct tasks are displayed |
| Create a task with valid information | Task is created if authorized |
| Submit invalid task information | Validation error is returned |
| Update an authorized task | Changes are saved |
| Access an unauthorized task | Access is denied |

## 6. AI Assistant Testing

| Test Case | Expected Result |
|---|---|
| Ask for a project summary | AI provides a relevant summary |
| Ask about pending tasks | Correct pending tasks are identified |
| Ask about overdue tasks | Overdue tasks are identified using due dates |
| Ask about task ownership | Correct assignee information is provided |
| Select one project | AI uses only the selected accessible project |
| Select all accessible projects | AI uses all projects the user can access |
| Ask about an inaccessible project | AI does not reveal restricted information |
| AI service becomes unavailable | Application handles the error appropriately |

## 7. Proposed Task Change Testing

| Test Case | Expected Result |
|---|---|
| Request an authorized task status change | AI displays a proposal |
| Confirm the proposed change | Task status is updated |
| Cancel the proposed change | Task remains unchanged |
| Request an unauthorized task change | Request is rejected |
| Confirm a change after permissions are revoked | Update is rejected |

## 8. Conversation and Persistence Testing

| Test Case | Expected Result |
|---|---|
| Create a new conversation | Conversation is saved |
| Send follow-up messages | Previous conversation context is available |
| Refresh the browser | Saved conversation history remains available |
| Open another user's conversation | Access is denied |
| Update a task and ask AI again | AI uses the latest database information |

## 9. Testing Results

The above test cases are the verification checklist for the application.

Actual results should be recorded after executing each test. Any failed test should be investigated and corrected before final submission.

## 10. Conclusion

This verification plan covers authentication, role-based authorization, project and task operations, AI responses, proposed task changes, conversation history, and database persistence. It helps ensure that the application meets the main assignment requirements.