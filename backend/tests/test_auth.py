def test_admin_login_success(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "admin@example.com",
            "password": "Admin@123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_manager_login_success(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "manager@example.com",
            "password": "Manager@123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_regular_user_login_success(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "user1@example.com",
            "password": "User1@123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "admin@example.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401


def test_login_unknown_email(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "unknown@example.com",
            "password": "Admin@123",
        },
    )

    assert response.status_code == 401


def test_get_current_user_profile(client):
    login_response = client.post(
        "/auth/login",
        data={
            "username": "admin@example.com",
            "password": "Admin@123",
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "admin@example.com"
    assert response.json()["role"] == "admin"


def test_profile_without_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401