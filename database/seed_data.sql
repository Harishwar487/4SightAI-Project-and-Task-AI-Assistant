
-- 4SightAI Sample Seed Data
-- Use this script only with a fresh database.
-- Demo passwords are stored as bcrypt hashes.

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- 1. USERS
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@example.com',
 '$2b$12$3dh5qs36baV532PSNejVp.Xj2x30lF9EUzd.XHzHG64OqbFSUaAF6', 'admin'),

(2, 'Project Manager', 'manager@example.com',
 '$2b$12$KCtOXINDOIyp6yubg5Ah6uULUBA6WhIb3.yb1C5hF3hqiZHOzI.LO', 'manager'),

(3, 'Regular User One', 'user1@example.com',
 '$2b$12$67k2VE1iBnuV1JSm84Z.MuBgWVsfRoy6g0i75rWAoC0diWMhSATCm', 'user'),

(4, 'Regular User Two', 'user2@example.com',
 '$2b$12$QB3hukC2v7YPub0F6anEnuKRdwM2LJKf0bdhBwuf2/vTarEd48uSC', 'user');


-- 2. PROJECTS
INSERT INTO projects (id, name, description, manager_id) VALUES
(1, 'Website Redesign', 'Redesign the company website.', 2),
(2, 'AI Assistant Development', 'Develop an AI-powered task assistant.', 2),
(3, 'Data Analytics Dashboard', 'Build a business analytics dashboard.', NULL);


-- 3. PROJECT MEMBERSHIPS
INSERT INTO project_members (id, user_id, project_id) VALUES
(1, 2, 1),
(2, 2, 2),
(3, 3, 1),
(4, 3, 2),
(5, 4, 2),
(6, 4, 3);


-- 4. TASKS
INSERT INTO tasks
(id, title, description, status, due_date, project_id, assignee_id)
VALUES

(1, 'Design homepage', NULL, 'In Progress',
 date('now', '+5 days'), 1, 3),

(2, 'Create navigation menu', NULL, 'Pending',
 date('now', '-3 days'), 1, 3),

(3, 'Update website content', NULL, 'Completed',
 date('now', '-5 days'), 1, 2),

(4, 'Test mobile responsiveness', NULL, 'Pending',
 date('now', '+7 days'), 1, 3),

(5, 'Design AI chat interface', NULL, 'In Progress',
 date('now', '+3 days'), 2, 4),

(6, 'Develop chatbot API', NULL, 'Pending',
 date('now', '-2 days'), 2, 3),

(7, 'Integrate language model', NULL, 'Completed',
 date('now', '-1 day'), 2, 2),

(8, 'Test AI responses', NULL, 'Pending',
 date('now', '+10 days'), 2, 4),

(9, 'Prepare dashboard layout', NULL, 'In Progress',
 date('now', '+4 days'), 3, 4),

(10, 'Create sales charts', NULL, 'Pending',
 date('now', '-4 days'), 3, 4),

(11, 'Connect analytics database', NULL, 'Completed',
 date('now', '-6 days'), 3, 1),

(12, 'Validate dashboard reports', NULL, 'Pending',
 date('now', '+14 days'), 3, 4);

COMMIT;
