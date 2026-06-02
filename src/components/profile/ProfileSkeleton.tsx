export function ProfileSkeleton() {
  return (
    <main className="animate-pulse">

      {/* ── Hero ── */}
      <section className="relative min-h-[28rem] bg-zinc-950 pt-16">
        <div className="absolute inset-0 bg-zinc-800" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#00000033_0%,#000000cc_78%)]" />

        <div className="relative mx-auto flex min-h-[calc(28rem-4rem)] max-w-7xl items-end px-4 py-10 sm:px-6 lg:py-14">
          <div className="w-full">
            {/* Badge row */}
            <div className="mb-6 flex gap-2">
              <div className="h-7 w-28 bg-white/10" />
              <div className="h-7 w-36 bg-white/10" />
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="h-28 w-28 shrink-0 border border-white/25 bg-white/15 sm:h-36 sm:w-36" />

              {/* Name + meta */}
              <div className="min-w-0 flex-1 space-y-4">
                <div className="h-3.5 w-32 bg-white/20" />
                <div className="h-14 w-full max-w-sm bg-white/20 sm:max-w-xl" />
                <div className="flex gap-4">
                  <div className="h-4 w-24 bg-white/15" />
                  <div className="h-4 w-28 bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main body ── */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 pb-20 sm:px-6 lg:grid-cols-[1.4fr_0.6fr]">

        {/* Left — bio + skills */}
        <div className="space-y-6">
          {/* Bio */}
          <div className="border border-zinc-200 bg-white p-6 sm:p-8 space-y-3">
            <div className="h-5 w-16 bg-zinc-100" />
            <div className="h-4 w-full bg-zinc-100" />
            <div className="h-4 w-11/12 bg-zinc-100" />
            <div className="h-4 w-4/5 bg-zinc-100" />
            <div className="h-4 w-2/3 bg-zinc-100" />
          </div>

          {/* Skills */}
          <div className="border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="h-5 w-14 bg-zinc-100" />
            <div className="mt-5 flex flex-wrap gap-2">
              {[80, 96, 64, 112, 72, 88].map((w) => (
                <div key={w} className="h-7 bg-zinc-100" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right — discipline + roles + links */}
        <aside className="space-y-5">
          {/* Discipline */}
          <div className="border border-zinc-200 bg-white p-5">
            <div className="h-4 w-24 bg-zinc-100" />
            <div className="mt-4 h-11 w-full bg-zinc-100" />
          </div>

          {/* Roles */}
          <div className="border border-zinc-200 bg-white p-5">
            <div className="h-4 w-32 bg-zinc-100" />
            <div className="mt-4 space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-10 w-full bg-zinc-100" />
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="border border-zinc-200 bg-white p-5">
            <div className="h-4 w-12 bg-zinc-100" />
            <div className="mt-4 flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-10 bg-zinc-100" />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
