"use client";

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Task, TaskStatus, STATUS_LABEL, STATUS_ORDER } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Plus, Inbox, Flame, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const DOT_COLOR: Record<TaskStatus, string> = {
  todo: "bg-neutral-400",
  doing: "bg-sky-500",
  done: "bg-emerald-500",
};

const GLOW: Record<TaskStatus, string> = {
  todo: "from-neutral-200/40 dark:from-neutral-700/20",
  doing: "from-sky-300/30 dark:from-sky-700/20",
  done: "from-emerald-300/30 dark:from-emerald-700/20",
};

const EMPTY_ICON: Record<TaskStatus, React.ComponentType<{ size?: number; className?: string }>> = {
  todo: Inbox,
  doing: Flame,
  done: CheckCircle2,
};

export function Column({
  status,
  tasks,
  onEdit,
  onDelete,
  onAdd,
  onMoveTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAdd: (status: TaskStatus) => void;
  onMoveTask: (id: string, direction: "prev" | "next") => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const EmptyIcon = EMPTY_ICON[status];
  const statusIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex h-full w-full min-w-[280px] flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={clsx("h-2 w-2 rounded-full", DOT_COLOR[status])} />
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {STATUS_LABEL[status]}
          </h2>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={tasks.length}
              initial={{ opacity: 0, y: -6, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
            >
              {tasks.length}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onAdd(status)}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
          aria-label="Thêm task"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      <motion.div
        ref={setNodeRef}
        animate={{ scale: isOver ? 1.015 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={clsx(
          "relative flex min-h-[140px] flex-1 flex-col gap-2.5 overflow-hidden rounded-2xl border p-2.5 transition-colors duration-200",
          isOver
            ? "border-violet-300 bg-violet-50 shadow-lg shadow-violet-500/10 dark:border-violet-500/40 dark:bg-violet-500/10"
            : "border-black/[0.03] bg-neutral-50/60 dark:border-white/5 dark:bg-white/[0.02]"
        )}
      >
        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-2 rounded-xl border-2 border-dashed border-violet-400/50"
            />
          )}
        </AnimatePresence>
        <div
          className={clsx(
            "pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl",
            GLOW[status]
          )}
        />

        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={(direction) => onMoveTask(task.id, direction)}
              canMovePrev={statusIndex > 0}
              canMoveNext={statusIndex < STATUS_ORDER.length - 1}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onAdd(status)}
            className="relative flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-8 text-neutral-400 hover:border-violet-300 hover:text-violet-500 dark:border-white/10 dark:text-neutral-600 dark:hover:border-violet-500/40"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <EmptyIcon size={22} />
            </motion.div>
            <span className="text-xs">Kéo task vào đây hoặc bấm để thêm</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
