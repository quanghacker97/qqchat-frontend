"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, ListTodo, X, Sparkles } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskStatus, STATUS_ORDER } from "@/types/task";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskFormModal, TaskFormValue } from "./TaskFormModal";

export function Board() {
  const { tasks, hydrated, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q)
    );
  }, [tasks, query]);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    for (const t of filtered) map[t.status].push(t);
    return map;
  }, [filtered]);

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    if (STATUS_ORDER.includes(newStatus)) {
      moveTask(String(active.id), newStatus);
    }
  }

  function openCreate(status: TaskStatus) {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleSubmit(value: TaskFormValue) {
    if (editingTask) {
      updateTask(editingTask.id, value);
    } else {
      addTask(value);
    }
    setModalOpen(false);
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-6 w-6 rounded-full border-2 border-violet-300 border-t-violet-600"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="sticky top-3 z-10 flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-violet-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-600/30"
            >
              <ListTodo size={19} />
              <Sparkles size={11} className="absolute -right-1 -top-1 text-amber-300" />
            </motion.div>
            <div>
              <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-lg font-bold leading-tight text-transparent dark:from-neutral-50 dark:to-neutral-300">
                Task Board
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {tasks.length} task · {doneCount} hoàn thành · {progress}%
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03, y: -1 }}
            onClick={() => openCreate("todo")}
            className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-shadow hover:shadow-violet-600/40"
          >
            <motion.span
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Plus size={16} />
            </motion.span>
            <span className="hidden sm:inline">Thêm task</span>
          </motion.button>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"
          >
            <div className="animate-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
        </div>

        <motion.div
          animate={{
            boxShadow: searchFocused
              ? "0 0 0 4px rgba(139,92,246,0.15)"
              : "0 0 0 0px rgba(139,92,246,0)",
          }}
          className="relative rounded-xl"
        >
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Tìm task theo tên, mô tả, người phụ trách..."
            className="w-full rounded-xl border border-neutral-200 bg-white/80 py-2 pl-9 pr-9 text-sm text-neutral-900 outline-none transition-colors focus:border-violet-400 dark:border-white/10 dark:bg-neutral-900/80 dark:text-neutral-100"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/10"
                aria-label="Xoá tìm kiếm"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          {STATUS_ORDER.map((status, i) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 26 }}
            >
              <Column
                status={status}
                tasks={byStatus[status]}
                onEdit={openEdit}
                onDelete={deleteTask}
                onAdd={openCreate}
              />
            </motion.div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <motion.div
              initial={{ scale: 1.03, rotate: 3 }}
              className="cursor-grabbing drop-shadow-2xl"
            >
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal
        open={modalOpen}
        initial={editingTask}
        defaultStatus={defaultStatus}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
