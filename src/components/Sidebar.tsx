"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ListTree, ListChecks, X } from "lucide-react";
import clsx from "clsx";
import { Task, TaskPriority, TaskStatus, STATUS_ORDER, STATUS_LABEL, PRIORITY_LABEL } from "@/types/task";
import { Avatar } from "./Avatar";

export interface SidebarFilters {
  statuses: Set<TaskStatus>;
  priorities: Set<TaskPriority>;
  assignees: Set<string>;
}

export function emptyFilters(): SidebarFilters {
  return { statuses: new Set(), priorities: new Set(), assignees: new Set() };
}

export function taskMatchesFilters(task: Task, filters: SidebarFilters): boolean {
  if (filters.statuses.size > 0 && !filters.statuses.has(task.status)) return false;
  if (filters.priorities.size > 0 && !filters.priorities.has(task.priority)) return false;
  if (filters.assignees.size > 0 && !filters.assignees.has(task.assignee || "__unassigned__")) return false;
  return true;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-rose-400",
};

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-neutral-400",
  doing: "bg-sky-500",
  done: "bg-emerald-500",
};

function TreeGroup({
  label,
  icon,
  defaultOpen = true,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          <ChevronRight size={13} />
        </motion.span>
        {icon}
        {label}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-3 flex flex-col gap-0.5 border-l border-neutral-200 py-1 pl-2.5 dark:border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TreeLeaf({
  active,
  onClick,
  dot,
  avatar,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  dot?: string;
  avatar?: string;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
          : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
      )}
    >
      <span
        className={clsx(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          active
            ? "border-violet-500 bg-violet-500"
            : "border-neutral-300 bg-transparent group-hover:border-neutral-400 dark:border-neutral-600"
        )}
      >
        <motion.svg
          viewBox="0 0 12 12"
          className="h-2.5 w-2.5 text-white"
          initial={false}
          animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </span>
      {dot && <span className={clsx("h-2 w-2 shrink-0 rounded-full", dot)} />}
      {avatar && <Avatar name={avatar} size={18} />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">{count}</span>
    </button>
  );
}

export function Sidebar({
  tasks,
  filters,
  onToggleStatus,
  onTogglePriority,
  onToggleAssignee,
  onClear,
}: {
  tasks: Task[];
  filters: SidebarFilters;
  onToggleStatus: (s: TaskStatus) => void;
  onTogglePriority: (p: TaskPriority) => void;
  onToggleAssignee: (a: string) => void;
  onClear: () => void;
}) {
  const statusCounts = useMemo(() => {
    const map: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 };
    for (const t of tasks) map[t.status]++;
    return map;
  }, [tasks]);

  const priorityCounts = useMemo(() => {
    const map: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0 };
    for (const t of tasks) map[t.priority]++;
    return map;
  }, [tasks]);

  const assignees = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      const key = t.assignee.trim() || "__unassigned__";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const activeCount = filters.statuses.size + filters.priorities.size + filters.assignees.size;

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center justify-between px-2 pb-1">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          <ListTree size={15} className="text-violet-500" />
          Bộ lọc
        </div>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-200 dark:bg-white/10 dark:text-neutral-400 dark:hover:bg-white/20"
            >
              <X size={11} />
              Xoá {activeCount}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <TreeGroup label="Trạng thái" icon={<ListChecks size={13} />}>
        {STATUS_ORDER.map((s) => (
          <TreeLeaf
            key={s}
            active={filters.statuses.has(s)}
            onClick={() => onToggleStatus(s)}
            dot={STATUS_DOT[s]}
            label={STATUS_LABEL[s]}
            count={statusCounts[s]}
          />
        ))}
      </TreeGroup>

      <TreeGroup label="Độ ưu tiên" icon={<ListChecks size={13} />}>
        {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
          <TreeLeaf
            key={p}
            active={filters.priorities.has(p)}
            onClick={() => onTogglePriority(p)}
            dot={PRIORITY_DOT[p]}
            label={PRIORITY_LABEL[p]}
            count={priorityCounts[p]}
          />
        ))}
      </TreeGroup>

      <TreeGroup label="Người phụ trách" icon={<ListChecks size={13} />}>
        {assignees.length === 0 && (
          <p className="px-2 py-1 text-xs text-neutral-400 dark:text-neutral-600">Chưa có ai</p>
        )}
        {assignees.map(([name, count]) => (
          <TreeLeaf
            key={name}
            active={filters.assignees.has(name)}
            onClick={() => onToggleAssignee(name)}
            avatar={name === "__unassigned__" ? "?" : name}
            label={name === "__unassigned__" ? "Chưa gán" : name}
            count={count}
          />
        ))}
      </TreeGroup>
    </div>
  );
}
