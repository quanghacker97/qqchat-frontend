"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Task, TaskPriority, TaskStatus, STATUS_LABEL, PRIORITY_LABEL, STATUS_ORDER } from "@/types/task";

export interface TaskFormValue {
  title: string;
  description: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

export function TaskFormModal({
  open,
  initial,
  defaultStatus,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial: Task | null;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSubmit: (value: TaskFormValue) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setAssignee(initial.assignee);
      setPriority(initial.priority);
      setStatus(initial.status);
      setDueDate(initial.dueDate ?? "");
    } else {
      setTitle("");
      setDescription("");
      setAssignee("");
      setPriority("medium");
      setStatus(defaultStatus);
      setDueDate("");
    }
  }, [open, initial, defaultStatus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim(),
      priority,
      status,
      dueDate: dueDate || null,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-neutral-900 sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {initial ? "Sửa task" : "Tạo task mới"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Tiêu đề
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Thiết kế màn hình đăng nhập"
                  required
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Chi tiết công việc..."
                  className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Người phụ trách
                  </label>
                  <input
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Tên"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Hạn chót
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 hover:bg-violet-700 active:scale-[0.98]"
              >
                {initial ? "Lưu thay đổi" : "Tạo task"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
