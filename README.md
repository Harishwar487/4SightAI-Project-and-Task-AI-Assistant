# 4SightAI – AI-Powered Project & Task Management Assistant

An AI-powered, role-based project and task management application built with **FastAPI, React, SQLite, and Google Gemini AI**. 4SightAI helps teams manage projects, organize tasks, collaborate through an AI assistant, and gain intelligent insights while maintaining secure, role-based access.

## 🚀 Project Overview

4SightAI combines traditional project management capabilities with Generative AI to make project and task management smarter and more efficient.

The application provides a centralized platform where users can manage projects, track tasks, communicate with an AI assistant, review conversation history, and interact with AI-powered task recommendations.

## ✨ Key Features

- **Project Management:** Create, organize, and manage projects.
- **Task Management:** Track tasks, monitor progress, and manage task details.
- **AI Assistant:** Interact with an AI-powered assistant using Google Gemini.
- **AI-Powered Insights:** Get intelligent assistance and recommendations for project and task management.
- **Conversation History:** Access previous AI conversations.
- **Role-Based Access Control:** Secure access based on user roles and permissions.
- **Task Change Management:** Review and manage AI-proposed task changes.
- **Authentication:** Secure user authentication and authorization.
- **Database Persistence:** Store application data using SQLite.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Backend | Python, FastAPI |
| Frontend | React.js, JavaScript |
| Database | SQLite |
| AI Integration | Google Gemini API |
| Frontend Build Tool | Vite |
| API Communication | REST APIs |
| Testing | Pytest |
| Version Control | Git, GitHub |

## 🏗️ Project Architecture

The application follows a frontend-backend architecture.

```text
4SightAI/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql
│   └── seed_data.sql
│
├── docs/
│   ├── ai_design.md
│   ├── api_documentation.md
│   ├── database_design.md
│   └── verification.md
│
├── tests/
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- Python 3.10 or later
- Node.js and npm
- Git
- Google Gemini API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Harishwar487/4SightAI-Project-and-Task-AI-Assistant.git
```

```bash
cd 4SightAI-Project-and-Task-AI-Assistant
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the project's configuration and Gemini API integration.

Start the backend server:

```bash
uvicorn app.main:app --reload
```

Backend API documentation (when the server is running):

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open
