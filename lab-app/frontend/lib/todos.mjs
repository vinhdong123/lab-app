// Hàm thuần để dễ test: kiểm tra và chuẩn hóa tiêu đề trước khi gửi lên API
export function normalizeTitle(raw) {
  return String(raw ?? "").trim().slice(0, 200);
}

export function isValidTitle(raw) {
  return normalizeTitle(raw).length > 0;
}

export function countRemaining(todos) {
  return todos.filter((t) => !t.done).length;
}
