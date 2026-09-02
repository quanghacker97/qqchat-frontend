export function SkeletonBoard() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-900/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-neutral-200 dark:bg-white/10" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
              <div className="h-2.5 w-32 animate-pulse rounded bg-neutral-100 dark:bg-white/5" />
            </div>
          </div>
          <div className="h-9 w-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-white/10" />
        </div>
        <div className="h-2 w-full animate-pulse rounded-full bg-neutral-100 dark:bg-white/10" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-white/5" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((col) => (
          <div key={col} className="flex flex-col gap-2.5">
            <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
            <div className="flex flex-col gap-2.5 rounded-2xl bg-neutral-50/60 p-2.5 dark:bg-white/[0.02]">
              {[0, 1].map((card) => (
                <div
                  key={card}
                  className="animate-pulse space-y-2 rounded-xl border border-black/5 bg-white p-3.5 dark:border-white/10 dark:bg-neutral-900"
                  style={{ animationDelay: `${(col * 2 + card) * 80}ms` }}
                >
                  <div className="h-3.5 w-3/4 rounded bg-neutral-200 dark:bg-white/10" />
                  <div className="h-2.5 w-full rounded bg-neutral-100 dark:bg-white/5" />
                  <div className="h-2.5 w-1/2 rounded bg-neutral-100 dark:bg-white/5" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-12 rounded-full bg-neutral-100 dark:bg-white/5" />
                    <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
