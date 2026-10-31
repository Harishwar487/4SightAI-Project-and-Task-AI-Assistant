def get_auth_headers(client, email, password):
    response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_admin_can_view_all_projects(client):
    headers = get_auth_headers(client, "admin@example.com", "Admin@123")
    response = client.get("/projects/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_manager_can_view_managed_projects(client):
    headers = get_auth_headers(client, "manager@example.com", "Manager@123")
    response = client.get("/projects/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_user_can_view_member_projects(client):
    headers = get_auth_headers(client, "user1@example.com", "User1@123")
    response = client.get("/projects/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_user_cannot_view_inaccessible_project(client):
    headers = get_auth_headers(client, "user1@example.com", "User1@123")
    response = client.get("/projects/2", headers=headers)
    assert response.status_code == 404


def test_user_can_view_accessible_tasks(client):
    headers = get_auth_headers(client, "user1@example.com", "User1@123")
    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_user_can_update_own_task_status(client):
    headers = get_auth_headers(client, "user1@example.com", "User1@123")
    response = client.patch(
        "/tasks/1/status",
        headers=headers,
        json={"status": "In Progress"},
    )
    assert response.status_code == 200


def test_user_cannot_update_other_users_task(client):
    headers = get_auth_headers(client, "user1@example.com", "User1@123")
    response = client.patch(
        "/tasks/2/status",
        headers=headers,
        json={"status": "Completed"},
    )
    assert response.status_code == 403


def test_user_cannot_edit_task_details(client):
    headers = get_auth_headers(client, "user1@example.com", "User1@123")
    response = client.patch(
        "/tasks/1",
        headers=headers,
        json={"title": "Unauthorized change"},
    )
    assert response.status_code == 403


def test_manager_can_edit_task_details(client):
    headers = get_auth_headers(client, "manager@example.com", "Manager@123")
    response = client.patch(
        "/tasks/1",
        headers=headers,
        json={"title": "Updated by manager"},
    )
    assert response.status_code == 200


def test_manager_cannot_create_project(client):
    headers = get_auth_headers(client, "manager@example.com", "Manager@123")
    response = client.post(
        "/projects/",
        headers=headers,
        json={"name": "Unauthorized Project"},
    )
    assert response.status_code == 403


def test_admin_can_create_project(client):
    headers = get_auth_headers(client, "admin@example.com", "Admin@123")
    response = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Admin Created Project",
            "description": "Permission test",
            "manager_id": 2,
        },
    )
    assert response.status_code == 201
