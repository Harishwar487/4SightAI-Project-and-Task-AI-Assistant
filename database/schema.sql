
-- 4SightAI Database Schema
-- Database: SQLite

PRAGMA foreign_keys = ON;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    manager_id INTEGER,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- 3. Project membership table
CREATE TABLE IF NOT EXISTS project_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    project_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- 4. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'Pending',
    due_date DATE,
    project_id INTEGER,
    assignee_id INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- 5. Task changes table
CREATE TABLE IF NOT EXISTS task_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    proposed_status VARCHAR(30),
    requested_by INTEGER,
    status VARCHAR(30) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
);

-- 6. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER,
    role VARCHAR(30),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Indexes for frequently searched columns

CREATE INDEX IF NOT EXISTS ix_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS ix_projects_manager_id
ON projects(manager_id);

CREATE INDEX IF NOT EXISTS ix_project_members_user_id
ON project_members(user_id);

CREATE INDEX IF NOT EXISTS ix_project_members_project_id
ON project_members(project_id);

CREATE INDEX IF NOT EXISTS ix_tasks_project_id
ON tasks(project_id);

CREATE INDEX IF NOT EXISTS ix_tasks_assignee_id
ON tasks(assignee_id);

CREATE INDEX IF NOT EXISTS ix_tasks_status
ON tasks(status);

CREATE INDEX IF NOT EXISTS ix_task_changes_task_id
ON task_changes(task_id);

CREATE INDEX IF NOT EXISTS ix_conversations_user_id
ON conversations(user_id);

CREATE INDEX IF NOT EXISTS ix_messages_conversation_id
ON messages(conversation_id);
