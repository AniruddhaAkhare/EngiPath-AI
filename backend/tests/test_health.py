"""
Tests: Health endpoint
"""


def test_health_returns_200(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_response_structure(client):
    response = client.get("/api/v1/health")
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data
    assert "database" in data


def test_health_database_connected(client):
    response = client.get("/api/v1/health")
    data = response.get_json()
    assert data["database"] == "connected"
