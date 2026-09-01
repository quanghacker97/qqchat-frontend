"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, ListTodo, X, Sparkles } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskStatus, STATUS_ORDER, STATUS_LABEL } from "@/types/task";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskFormModal, TaskFormValue } from "./TaskFormModal";
import { ToastStack, ToastItem, ToastTone } from "./Toast";
import { Confetti } from "./Confetti";
import { SkeletonBoard } from "./SkeletonBoard";

export function Board() {
  const { tasks, hydrated, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const celebratedRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const columnRefs = useRef<Map<TaskStatus, HTMLDivElement>>(new Map());
  const scrollFrame = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const pushToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

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
    const task = tasks.find((t) => t.id === active.id);
    if (STATUS_ORDER.includes(newStatus) && task && task.status !== newStatus) {
      moveTask(String(active.id), newStatus);
      pushToast(
        newStatus === "done" ? `🎉 Hoàn thành: ${task.title}` : `Đã chuyển sang ${STATUS_LABEL[newStatus]}`,
        newStatus === "done" ? "celebrate" : "success"
      );
    }
  }

  function handleQuickMove(id: string, direction: "prev" | "next") {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const idx = STATUS_ORDER.indexOf(task.status);
    const nextIdx = direction === "next" ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return;
    const newStatus = STATUS_ORDER[nextIdx];
    moveTask(id, newStatus);
    pushToast(
      newStatus === "done" ? `🎉 Hoàn thành: ${task.title}` : `Đã chuyển sang ${STATUS_LABEL[newStatus]}`,
      newStatus === "done" ? "celebrate" : "success"
    );
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

  function handleDelete(id: string) {
    const task = tasks.find((t) => t.id === id);
    deleteTask(id);
    if (task) pushToast(`Đã xoá: ${task.title}`, "danger");
  }

  function handleSubmit(value: TaskFormValue) {
    if (editingTask) {
      const statusChanged = editingTask.status !== value.status;
      updateTask(editingTask.id, value);
      pushToast(
        statusChanged && value.status === "done" ? `🎉 Hoàn thành: ${value.title}` : `Đã lưu: ${value.title}`,
        statusChanged && value.status === "done" ? "celebrate" : "success"
      );
    } else {
      addTask(value);
      pushToast(`Đã tạo: ${value.title}`, "success");
    }
    setModalOpen(false);
  }

  const handleScroll = useCallback(() => {
    if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      STATUS_ORDER.forEach((status, i) => {
        const el = columnRefs.current.get(status);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - containerCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      setActiveMobileIndex(closestIndex);
    });
  }, []);

  function scrollToColumn(status: TaskStatus) {
    columnRefs.current.get(status)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  useEffect(() => {
    if (progress === 100 && tasks.length > 0) {
      if (!celebratedRef.current) {
        celebratedRef.current = true;
        setShowConfetti(true);
        const t = setTimeout(() => setShowConfetti(false), 2200);
        return () => clearTimeout(t);
      }
    } else {
      celebratedRef.current = false;
    }
  }, [progress, tasks.length]);

  if (!hydrated) {
    return <SkeletonBoard />;
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
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {STATUS_ORDER.map((status, i) => (
            <motion.div
              key={status}
              ref={(el) => {
                if (el) columnRefs.current.set(status, el);
                else columnRefs.current.delete(status);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 26 }}
              className="w-[86%] shrink-0 snap-center sm:w-auto sm:shrink"
            >
              <Column
                status={status}
                tasks={byStatus[status]}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAdd={openCreate}
                onMoveTask={handleQuickMove}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5 sm:hidden">
          {STATUS_ORDER.map((status, i) => (
            <button
              key={status}
              onClick={() => scrollToColumn(status)}
              aria-label={`Xem ${STATUS_LABEL[status]}`}
              className="p-1.5"
            >
              <motion.span
                animate={{
                  width: activeMobileIndex === i ? 18 : 6,
                  opacity: activeMobileIndex === i ? 1 : 0.4,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="block h-1.5 rounded-full bg-violet-500"
              />
            </button>
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

      <ToastStack toasts={toasts} />
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>
    </div>
  );
}
