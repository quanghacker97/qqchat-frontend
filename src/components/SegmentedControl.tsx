"use client";

import { motion } from "framer-motion";

export function SegmentedControl<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-white/5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${name}-pill`}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-neutral-700"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
