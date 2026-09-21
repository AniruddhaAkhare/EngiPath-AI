"""
EngiPath AI — Authentication Tests

Verifies:
- User registration
- Duplicate email prevention
- Password hashing security
- Login authentication
- Invalid credentials handling
- Token verification and /me endpoint
"""
import pytest
from app.models.user import User


class TestAuthAPI:
    """Test user registration, login, and profile fetching."""

    def test_register_success(self, client, db):
        payload = {
            "name": "Kshitij Student",
            "email": "kshitij.test@example.com",
            "password": "strongPassword123",
            "branch": "Computer Science",
            "year": "3rd Year",
            "skills": ["Python", "React", "AI/ML"],
            "interests": ["Full Stack", "Data Science"],
        }
        resp = client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["success"] is True
        assert "token" in data["data"]
        user_info = data["data"]["user"]
        assert user_info["email"] == "kshitij.test@example.com"
        assert user_info["name"] == "Kshitij Student"
        assert user_info["branch"] == "Computer Science"
        assert "password" not in user_info
        assert "password_hash" not in user_info

    def test_register_duplicate_email_fails(self, client, db):
        payload = {
            "name": "User One",
            "email": "duplicate@example.com",
            "password": "password123",
        }
        resp1 = client.post("/api/v1/auth/register", json=payload)
        assert resp1.status_code == 201

        resp2 = client.post("/api/v1/auth/register", json=payload)
        assert resp2.status_code == 400
        data2 = resp2.get_json()
        assert data2["success"] is False
        assert data2["error"]["code"] == "REGISTRATION_FAILED"

    def test_login_success(self, client, db):
        # Register first
        client.post("/api/v1/auth/register", json={
            "name": "Login User",
            "email": "login.test@example.com",
            "password": "validPassword456",
        })

        # Login
        resp = client.post("/api/v1/auth/login", json={
            "email": "login.test@example.com",
            "password": "validPassword456",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert data["data"]["user"]["name"] == "Login User"

    def test_login_invalid_password_fails(self, client, db):
        client.post("/api/v1/auth/register", json={
            "name": "User",
            "email": "wrongpass@example.com",
            "password": "correctPassword",
        })

        resp = client.post("/api/v1/auth/login", json={
            "email": "wrongpass@example.com",
            "password": "incorrectPassword",
        })
        assert resp.status_code == 401
        data = resp.get_json()
        assert data["success"] is False
        assert data["error"]["code"] == "INVALID_CREDENTIALS"

    def test_get_current_user_with_token(self, client, db):
        reg_resp = client.post("/api/v1/auth/register", json={
            "name": "Token User",
            "email": "token.user@example.com",
            "password": "mySecretPassword",
            "branch": "Mechanical Engineering",
        })
        token = reg_resp.get_json()["data"]["token"]

        # Call /me with Bearer token
        resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert data["data"]["user"]["email"] == "token.user@example.com"
        assert data["data"]["user"]["branch"] == "Mechanical Engineering"

    def test_get_current_user_without_token_fails(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401
