"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ImagePlus, Clipboard } from "lucide-react";
import { Task, TaskPriority, TaskStatus, STATUS_LABEL, PRIORITY_LABEL, STATUS_ORDER } from "@/types/task";
import { SegmentedControl } from "./SegmentedControl";
import { fileToCompressedDataUrl } from "@/lib/image";

export interface TaskFormValue {
  title: string;
  description: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  images: string[];
}

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
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
  const [images, setImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setAssignee(initial.assignee);
      setPriority(initial.priority);
      setStatus(initial.status);
      setDueDate(initial.dueDate ?? "");
      setImages(initial.images ?? []);
    } else {
      setTitle("");
      setDescription("");
      setAssignee("");
      setPriority("medium");
      setStatus(defaultStatus);
      setDueDate("");
      setImages([]);
    }
  }, [open, initial, defaultStatus]);

  const fieldContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
  };
  const fieldItem = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 30 } },
  };

  async function addImageFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setIsProcessingImage(true);
    try {
      const dataUrls = await Promise.all(imageFiles.map((f) => fileToCompressedDataUrl(f)));
      setImages((prev) => [...prev, ...dataUrls]);
    } catch {
      // ignore unreadable image
    } finally {
      setIsProcessingImage(false);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      addImageFiles(files);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addImageFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

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
      images,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-md sm:items-center"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            onPaste={handlePaste}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/60 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95 sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {initial ? "Sửa task" : "Tạo task mới"}
              </h2>
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </motion.button>
            </div>

            <motion.div variants={fieldContainer} initial="hidden" animate="show" className="space-y-3">
              <motion.div variants={fieldItem}>
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
              </motion.div>

              <motion.div variants={fieldItem}>
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
              </motion.div>

              <motion.div variants={fieldItem}>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <span>Ảnh đính kèm</span>
                  {isProcessingImage && <span className="text-violet-500">Đang xử lý...</span>}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-xs text-neutral-500 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-white/15 dark:text-neutral-400 dark:hover:border-violet-500/60 dark:hover:text-violet-400"
                >
                  <Clipboard size={13} />
                  Dán ảnh (Ctrl+V) hoặc
                  <span className="inline-flex items-center gap-1 font-medium">
                    <ImagePlus size={13} /> chọn file
                  </span>
                </button>

                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 flex flex-wrap gap-2 overflow-hidden"
                    >
                      {images.map((src, i) => (
                        <motion.div
                          key={src.slice(0, 40) + i}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ type: "spring", stiffness: 500, damping: 28 }}
                          className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-white/10"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Xoá ảnh"
                          >
                            <X size={11} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={fieldItem} className="grid grid-cols-2 gap-3">
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
              </motion.div>

              <motion.div variants={fieldItem}>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Chọn nhanh hạn chót
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                    const value = addDays(n);
                    const active = dueDate === value;
                    return (
                      <motion.button
                        key={n}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDueDate(value)}
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? "border-violet-500 bg-violet-500 text-white"
                            : "border-neutral-200 text-neutral-500 hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:text-neutral-400 dark:hover:border-violet-500/50 dark:hover:text-violet-400"
                        }`}
                      >
                        +{n}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={fieldItem}>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Độ ưu tiên
                </label>
                <SegmentedControl
                  name="priority"
                  value={priority}
                  onChange={setPriority}
                  options={(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => ({
                    value: p,
                    label: PRIORITY_LABEL[p],
                  }))}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Trạng thái
                </label>
                <SegmentedControl
                  name="status"
                  value={status}
                  onChange={setStatus}
                  options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                />
              </motion.div>
            </motion.div>

            <div className="mt-5 flex justify-end gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                Huỷ
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40"
              >
                {initial ? "Lưu thay đổi" : "Tạo task"}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
