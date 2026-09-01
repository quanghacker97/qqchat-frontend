"use client";

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Plus, Search, ListTodo } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskStatus, STATUS_ORDER } from "@/types/task";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskFormModal, TaskFormValue } from "./TaskFormModal";

export function Board() {
  const { tasks, hydrated, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const [query, setQuery] = useState("");
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
    return <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">Đang tải...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/30">
              <ListTodo size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-neutral-900 dark:text-neutral-100">
                Task Board
              </h1>
              <p className="text-xs text-neutral-400">
                {tasks.length} task · {doneCount} hoàn thành · {progress}%
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => openCreate("todo")}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 hover:bg-violet-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Thêm task</span>
          </motion.button>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm task theo tên, mô tả, người phụ trách..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none ring-violet-500/30 focus:border-violet-400 focus:ring-2 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={byStatus[status]}
              onEdit={openEdit}
              onDelete={deleteTask}
              onAdd={openCreate}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
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
