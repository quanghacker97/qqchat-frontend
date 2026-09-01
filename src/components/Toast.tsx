"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Trash2 } from "lucide-react";

export type ToastTone = "success" | "info" | "danger" | "celebrate";

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

const ICON: Record<ToastTone, React.ComponentType<{ size?: number; className?: string }>> = {
  success: CheckCircle2,
  info: Info,
  danger: Trash2,
  celebrate: CheckCircle2,
};

const ICON_COLOR: Record<ToastTone, string> = {
  success: "text-emerald-500",
  info: "text-sky-500",
  danger: "text-rose-500",
  celebrate: "text-amber-500",
};

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-800 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/90 dark:text-neutral-100"
            >
              <Icon size={15} className={ICON_COLOR[t.tone]} />
              {t.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
