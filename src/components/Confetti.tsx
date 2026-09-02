"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#8b5cf6", "#d946ef", "#f59e0b", "#10b981", "#38bdf8", "#f43f5e"];

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 420,
        delay: Math.random() * 0.25,
        duration: 1.3 + Math.random() * 0.9,
        rotate: (Math.random() - 0.5) * 540,
        color: COLORS[i % COLORS.length],
        w: 5 + Math.random() * 5,
        h: 8 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: p.x, y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: 480, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          className="absolute rounded-sm"
          style={{ width: p.w, height: p.h, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
