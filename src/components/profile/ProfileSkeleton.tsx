export function ProfileSkeleton() {
  return (
    <main className="animate-pulse">
      <section className="relative min-h-[28rem] bg-zinc-950 pt-16 text-white">
        <div className="absolute inset-0 bg-zinc-800" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#00000033_0%,#000000cc_78%)]" />

        <div className="relative mx-auto flex min-h-[calc(28rem-4rem)] max-w-7xl items-end px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="h-32 w-32 shrink-0 border border-white/25 bg-white/20 sm:h-40 sm:w-40" />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="h-4 w-40 bg-white/20" />
                <div className="h-14 w-full max-w-xl bg-white/20" />
                <div className="h-5 w-full max-w-lg bg-white/15" />
              </div>
            </div>
            <div className="hidden border border-white/15 bg-white/10 p-5 lg:block">
              <div className="h-4 w-24 bg-white/20" />
              <div className="mt-4 h-8 w-32 bg-white/20" />
              <div className="mt-6 h-2 w-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="border border-zinc-200 bg-white p-5">
            <div className="h-3 w-20 bg-zinc-100" />
            <div className="mt-4 h-6 w-36 bg-zinc-100" />
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5 border border-zinc-200 p-6">
          <div className="h-5 w-32 bg-zinc-100" />
          <div className="h-4 w-full bg-zinc-100" />
          <div className="h-4 w-11/12 bg-zinc-100" />
          <div className="h-4 w-3/4 bg-zinc-100" />
        </div>
        <div className="border border-zinc-200 p-6">
          <div className="h-5 w-24 bg-zinc-100" />
          <div className="mt-6 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-8 w-20 bg-zinc-100" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
