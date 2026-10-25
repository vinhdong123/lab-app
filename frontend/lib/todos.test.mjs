import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTitle, isValidTitle, countRemaining } from "./todos.mjs";

test("normalizeTitle cắt khoảng trắng", () => {
  assert.equal(normalizeTitle("  học docker  "), "học docker");
});

test("normalizeTitle giới hạn 200 ký tự", () => {
  assert.equal(normalizeTitle("a".repeat(300)).length, 200);
});

test("isValidTitle từ chối chuỗi rỗng", () => {
  assert.equal(isValidTitle("   "), false);
  assert.equal(isValidTitle(undefined), false);
  assert.equal(isValidTitle("ok"), true);
});

test("countRemaining đếm việc chưa xong", () => {
  const todos = [{ done: true }, { done: false }, { done: false }];
  assert.equal(countRemaining(todos), 2);
});
