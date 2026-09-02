"use client";

import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "@/types/task";

const STORAGE_KEY = "qqchat-tasks-v1";

const SEED_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Thiết kế giao diện trang chủ",
    description: "Phác thảo wireframe và chọn bảng màu chính cho sản phẩm.",
    assignee: "Quang",
    priority: "high",
    status: "todo",
    dueDate: null,
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: "Viết API xác thực người dùng",
    description: "Đăng ký, đăng nhập, refresh token.",
    assignee: "Minh",
    priority: "high",
    status: "doing",
    dueDate: null,
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: "Setup dự án Next.js",
    description: "Khởi tạo repo, cấu hình Tailwind, ESLint.",
    assignee: "Quang",
    priority: "medium",
    status: "done",
    dueDate: null,
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TASKS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => ({ images: [], ...t }));
    }
    return SEED_TASKS;
  } catch {
    return SEED_TASKS;
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const addTask = useCallback((data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    setTasks((prev) => [
      {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const updateTask = useCallback((id: string, data: Partial<Omit<Task, "id" | "createdAt">>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: Date.now() } : t))
    );
  }, []);

  return { tasks, hydrated, addTask, updateTask, deleteTask, moveTask };
}
