# Lab Todo: Next.js + FastAPI + Docker + CI

Web app todo cơ bản dùng để thực hành containerize và CI/CD có test, security gates.

```
lab-app/
├── backend/            FastAPI (Python)
│   ├── app/main.py
│   ├── tests/test_main.py
│   └── Dockerfile
├── frontend/           Next.js 15
│   ├── app/page.js
│   ├── lib/todos.mjs (+ test)
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
└── DECISIONS.md
```

## Chạy bằng Docker

```bash
docker compose up --build
```

Mở http://localhost:3000. API docs của backend không mở ra ngoài; kiểm tra nhanh bằng `curl http://localhost:3000/api/health`.

## Chạy local không Docker

```bash
# Terminal 1: backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

Mở http://localhost:3000 (frontend tự chuyển `/api/*` sang `localhost:8000`).

## Chạy test

```bash
cd backend && pytest -q
cd frontend && npm run lint && npm test
```

## CI (GitHub Actions)

Push lên GitHub, workflow `.github/workflows/ci.yml` tự chạy:
1. Test backend và frontend (song song)
2. Security: gitleaks, bandit, pip-audit, npm audit
3. Build image, quét bằng Trivy, smoke test bằng docker compose

Các quyết định thiết kế nằm trong [DECISIONS.md](DECISIONS.md).
