"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Pencil, Trash2, CalendarDays, GripVertical } from "lucide-react";
import { Task } from "@/types/task";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isOverdue(iso: string, status: Task["status"]) {
  if (status === "done") return false;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  function stopDrag(e: React.PointerEvent) {
    e.stopPropagation();
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative touch-none cursor-grab select-none rounded-xl border border-black/5 bg-white p-3.5 shadow-sm ring-1 ring-black/[0.02] hover:shadow-md active:cursor-grabbing dark:border-white/10 dark:bg-neutral-900 dark:ring-white/5"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <GripVertical
            size={16}
            className="shrink-0 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-600"
          />
          <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {task.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onPointerDown={stopDrag}
            onClick={() => onEdit(task)}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            aria-label="Sửa"
          >
            <Pencil size={14} />
          </button>
          <button
            onPointerDown={stopDrag}
            onClick={() => onDelete(task.id)}
            className="rounded-md p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            aria-label="Xoá"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {task.assignee && <Avatar name={task.assignee} size={24} />}
      </div>

      {task.dueDate && (
        <div
          className={`mt-2.5 flex items-center gap-1 text-[11px] font-medium ${
            isOverdue(task.dueDate, task.status)
              ? "text-rose-600 dark:text-rose-400"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          <CalendarDays size={12} />
          {formatDate(task.dueDate)}
          {isOverdue(task.dueDate, task.status) && <span>· Quá hạn</span>}
        </div>
      )}
    </motion.div>
  );
}
