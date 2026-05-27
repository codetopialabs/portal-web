export function PortalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-end gap-2" role="status" aria-label="Loading portal">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-3 w-3 bg-zinc-900 animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
