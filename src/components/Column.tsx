"use client";

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Task, TaskStatus, STATUS_LABEL } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";
import clsx from "clsx";

const DOT_COLOR: Record<TaskStatus, string> = {
  todo: "bg-neutral-400",
  doing: "bg-sky-500",
  done: "bg-emerald-500",
};

export function Column({
  status,
  tasks,
  onEdit,
  onDelete,
  onAdd,
}: {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAdd: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-full min-w-[280px] flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={clsx("h-2 w-2 rounded-full", DOT_COLOR[status])} />
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {STATUS_LABEL[status]}
          </h2>
          <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(status)}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
          aria-label="Thêm task"
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          "flex min-h-[120px] flex-1 flex-col gap-2.5 rounded-2xl p-2.5 transition-colors",
          isOver ? "bg-violet-50 dark:bg-violet-500/10" : "bg-neutral-50/60 dark:bg-white/[0.02]"
        )}
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onAdd(status)}
            className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-200 py-8 text-xs text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 dark:border-white/10 dark:text-neutral-600"
          >
            Kéo task vào đây hoặc bấm để thêm
          </motion.button>
        )}
      </div>
    </div>
  );
}
