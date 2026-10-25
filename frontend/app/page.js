"use client";

import { useEffect, useState } from "react";
import { countRemaining, isValidTitle, normalizeTitle } from "../lib/todos.mjs";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTodos(await res.json());
      setError("");
    } catch {
      setError("Không kết nối được backend.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!isValidTitle(title)) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: normalizeTitle(title) }),
    });
    if (res.ok) {
      setTitle("");
      load();
    } else {
      setError("Không thêm được việc này.");
    }
  }

  async function toggle(id) {
    await fetch(`/api/todos/${id}`, { method: "PATCH" });
    load();
  }

  async function remove(id) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main>
      <h1>Lab Todo</h1>
      <p className="sub">Frontend Next.js &middot; Backend FastAPI (Python)</p>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Thêm một việc cần làm..."
          aria-label="Tiêu đề việc cần làm"
        />
        <button type="submit">Thêm</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul>
        {todos.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
              aria-label={`Đánh dấu xong: ${t.title}`}
            />
            <span>{t.title}</span>
            <button className="del" onClick={() => remove(t.id)}>
              Xóa
            </button>
          </li>
        ))}
      </ul>

      <p className="footer">Còn lại: {countRemaining(todos)} việc</p>
    </main>
  );
}
