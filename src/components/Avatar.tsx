const COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-fuchsia-500",
  "bg-cyan-500",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(
        name || "?"
      )}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      title={name}
    >
      {initial}
    </div>
  );
}
