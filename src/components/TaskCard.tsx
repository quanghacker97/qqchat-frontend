"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Pencil, Trash2, CalendarDays, GripVertical, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Task, TaskPriority } from "@/types/task";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";

const ACCENT: Record<TaskPriority, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-rose-400",
};

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
  onMove,
  canMovePrev,
  canMoveNext,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove?: (direction: "prev" | "next") => void;
  canMovePrev?: boolean;
  canMoveNext?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const [removing, setRemoving] = useState(false);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  function stopDrag(e: React.PointerEvent) {
    e.stopPropagation();
  }

  function handleDeleteClick() {
    setRemoving(true);
    setTimeout(() => onDelete(task.id), 240);
  }

  const isDone = task.status === "done";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={
        removing
          ? { opacity: 0, scale: 0.92, x: 60, transition: { duration: 0.22, ease: "easeIn" } }
          : { opacity: isDragging ? 0.4 : 1, y: 0, scale: 1, x: 0 }
      }
      exit={{ opacity: 0, scale: 0.9, x: 60, transition: { duration: 0.18 } }}
      whileHover={removing ? undefined : { y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative touch-none cursor-grab select-none overflow-hidden rounded-xl border border-black/5 bg-white p-3.5 pl-4 shadow-sm ring-1 ring-black/[0.02] transition-shadow hover:shadow-lg hover:shadow-violet-900/10 active:cursor-grabbing dark:border-white/10 dark:bg-neutral-900 dark:ring-white/5"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${ACCENT[task.priority]}`} />
      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: removing ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none absolute inset-0 bg-rose-500/10"
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <GripVertical
            size={16}
            className="shrink-0 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-600"
          />
          <h3
            className={`truncate text-sm font-semibold ${
              isDone
                ? "text-neutral-400 line-through dark:text-neutral-600"
                : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {task.title}
          </h3>
          {isDone && (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="shrink-0 text-emerald-500"
            >
              <CheckCircle2 size={14} />
            </motion.span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onPointerDown={stopDrag}
            onClick={() => onEdit(task)}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            aria-label="Sửa"
          >
            <Pencil size={14} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onPointerDown={stopDrag}
            onClick={handleDeleteClick}
            className="rounded-md p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            aria-label="Xoá"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {task.description}
        </p>
      )}

      {task.images && task.images.length > 0 && (
        <div className="mb-3 flex gap-1.5">
          {task.images.slice(0, 3).map((src, i) => {
            const isLastVisible = i === 2 && task.images.length > 3;
            return (
              <motion.button
                key={src.slice(0, 40) + i}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onPointerDown={stopDrag}
                onClick={() => window.open(src, "_blank")}
                className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-black/5 dark:border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {isLastVisible && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-semibold text-white">
                    +{task.images.length - 2}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {task.assignee && <Avatar name={task.assignee} size={24} />}
      </div>

      {onMove && (canMovePrev || canMoveNext) && (
        <div className="mt-2.5 flex items-center justify-end gap-1 border-t border-black/5 pt-2.5 dark:border-white/5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={canMovePrev ? { scale: 1.1, x: -1 } : undefined}
            onPointerDown={stopDrag}
            onClick={() => canMovePrev && onMove("prev")}
            disabled={!canMovePrev}
            className="rounded-md p-1 text-neutral-400 enabled:hover:bg-neutral-100 enabled:hover:text-neutral-700 disabled:opacity-25 dark:enabled:hover:bg-white/10 dark:enabled:hover:text-neutral-200"
            aria-label="Chuyển về trước"
          >
            <ChevronLeft size={15} />
          </motion.button>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-300 dark:text-neutral-600">
            Chuyển
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={canMoveNext ? { scale: 1.1, x: 1 } : undefined}
            onPointerDown={stopDrag}
            onClick={() => canMoveNext && onMove("next")}
            disabled={!canMoveNext}
            className="rounded-md p-1 text-neutral-400 enabled:hover:bg-neutral-100 enabled:hover:text-neutral-700 disabled:opacity-25 dark:enabled:hover:bg-white/10 dark:enabled:hover:text-neutral-200"
            aria-label="Chuyển tiếp"
          >
            <ChevronRight size={15} />
          </motion.button>
        </div>
      )}

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
