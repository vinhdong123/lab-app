from itertools import count

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Lab API", version="1.0.0")

_ids = count(1)
_todos: dict[int, dict] = {}


class TodoIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class Todo(TodoIn):
    id: int
    done: bool = False


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/todos", response_model=list[Todo])
def list_todos() -> list[dict]:
    return list(_todos.values())


@app.post("/api/todos", response_model=Todo, status_code=201)
def create_todo(payload: TodoIn) -> dict:
    todo_id = next(_ids)
    todo = {"id": todo_id, "title": payload.title.strip(), "done": False}
    _todos[todo_id] = todo
    return todo


@app.patch("/api/todos/{todo_id}", response_model=Todo)
def toggle_todo(todo_id: int) -> dict:
    todo = _todos.get(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo["done"] = not todo["done"]
    return todo


@app.delete("/api/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int) -> None:
    if _todos.pop(todo_id, None) is None:
        raise HTTPException(status_code=404, detail="Todo not found")
