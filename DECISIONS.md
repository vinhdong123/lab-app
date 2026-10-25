# Decisions

Mỗi quyết định gồm: chọn gì, vì sao, đánh đổi gì.

## 1. Kiến trúc: 2 container (frontend, backend)
- **Chọn:** Next.js làm frontend, FastAPI làm backend, ghép bằng docker-compose.
- **Vì sao:** tách riêng để build và scale độc lập; đúng yêu cầu "containerize the full app".
- **Đánh đổi:** dữ liệu todo lưu trong bộ nhớ nên mất khi restart. Chấp nhận được cho lab; bước tiếp theo là thêm PostgreSQL.

## 2. Frontend gọi API qua rewrites của Next.js
- **Chọn:** trình duyệt gọi `/api/...` trên cổng 3000, Next.js chuyển tiếp sang `http://backend:8000`.
- **Vì sao:** không cần mở cổng backend ra ngoài, không phải cấu hình CORS.
- **Đánh đổi:** `BACKEND_URL` được cố định lúc build (build arg), muốn đổi phải build lại image.

## 3. Dockerfile
- **Multi-stage + `output: standalone`** cho frontend để image nhỏ.
- **Chạy bằng user thường** (không root) ở cả hai image.
- **`python:3.12-slim` và `node:20-alpine`** để giảm bề mặt tấn công; có `.dockerignore` để không đưa `.env`, `node_modules` vào image.
- **Đánh đổi:** alpine dùng musl nên đôi khi lệch với môi trường dev; ở đây chưa gặp vấn đề.

## 4. CI: GitHub Actions
- **Chọn:** GitHub Actions vì repo nằm trên GitHub, không cần tự dựng server như Jenkins.
- **Luồng:** `test (song song) → security → build + scan image + smoke test`. Job sau chỉ chạy khi job trước xanh (`needs`).

## 5. Security gates
| Gate | Công cụ | Chặn khi |
|---|---|---|
| Lộ secret | gitleaks | phát hiện secret trong lịch sử commit |
| Lỗi code Python | bandit (`-ll`) | có cảnh báo mức MEDIUM trở lên |
| Thư viện Python có CVE | pip-audit | có lỗ hổng đã biết |
| Thư viện Node có CVE | npm audit | mức high trở lên (chỉ dependencies chạy thật) |
| Lỗ hổng trong image | Trivy | mức HIGH/CRITICAL đã có bản vá |

- **Đánh đổi:** dùng `ignore-unfixed` để không chặn vì lỗ hổng chưa ai vá được; ngưỡng HIGH/CRITICAL để tránh nhiễu từ cảnh báo nhỏ.

## 6. Chưa làm (cố ý)
- Push image lên registry và deploy tự động.
- Test end-to-end (Playwright).
- Database thật, xác thực người dùng.

## 7. Phiên bản Next.js và lỗ hổng PostCSS
- **Chọn:** Next.js 15 + React 19, kèm `overrides` ép `postcss` lên bản đã vá trong `package.json`.
- **Vì sao:** gate `npm audit` báo lỗ hổng high/critical ở PostCSS mà Next.js đóng gói sẵn; dòng Next 14 chưa có bản sửa, bản sửa chính thức chỉ có ở Next 16.
- **Đánh đổi:** `overrides` là cách tạm; Next 16 bỏ lệnh `next lint` và cần cấu hình ESLint mới nên chưa nâng. Khi có bản Next 15 tự kèm PostCSS đã vá thì bỏ `overrides`.

## 8. Nâng FastAPI sau khi gate pip-audit báo lỗi
- **Chọn:** nâng FastAPI 0.115.6 lên 0.162.0 và uvicorn lên 0.54.0.
- **Vì sao:** lần chạy CI đầu tiên đỏ ở job `security`, pip-audit phát hiện 7 lỗ hổng trong starlette 0.41.3 mà FastAPI cũ kéo theo. Bản mới dùng starlette 1.x đã vá.
- **Đánh đổi:** nhảy nhiều phiên bản cùng lúc có thể phá API cũ; 4 test backend vẫn qua nên chấp nhận.

## 9. Ghim trivy-action theo mã commit (SHA)
- **Chọn:** `aquasecurity/trivy-action@57a97c7e... # v0.35.0` thay cho tag như `@0.28.0` hay `@master`.
- **Vì sao:** tag `0.28.0` không tồn tại (tag đúng có chữ `v`), và quan trọng hơn, tháng 3/2026 hầu hết tag của action này bị chuyển hướng sang mã độc (CVE-2026-33634). Chỉ `v0.35.0` không bị ảnh hưởng. Tag có thể bị đổi chỗ, còn SHA thì không.
- **Đánh đổi:** phải tự cập nhật SHA khi muốn lên bản mới.