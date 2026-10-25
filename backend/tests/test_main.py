from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_create_and_list_todo():
    res = client.post("/api/todos", json={"title": "Học Docker"})
    assert res.status_code == 201
    created = res.json()
    assert created["title"] == "Học Docker"
    assert created["done"] is False

    todos = client.get("/api/todos").json()
    assert any(t["id"] == created["id"] for t in todos)


def test_reject_empty_title():
    res = client.post("/api/todos", json={"title": ""})
    assert res.status_code == 422


def test_toggle_and_delete():
    todo = client.post("/api/todos", json={"title": "Viết CI"}).json()

    toggled = client.patch(f"/api/todos/{todo['id']}").json()
    assert toggled["done"] is True

    assert client.delete(f"/api/todos/{todo['id']}").status_code == 204
    assert client.patch(f"/api/todos/{todo['id']}").status_code == 404
