interface SessionLoadErrorProps {
  message: string;
  onReset: () => void;
  onRetry?: () => void;
}

export function SessionLoadError({ message, onReset, onRetry }: SessionLoadErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div className="max-w-sm border border-zinc-200 bg-white p-6">
        <p className="font-sans text-lg font-black uppercase tracking-tight text-zinc-900">
          Session could not load
        </p>
        <p className="mt-2 font-mono text-xs leading-6 text-zinc-500">{message}</p>

        <div className="mt-5 flex flex-col gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 w-full items-center justify-center bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
            >
              Retry Connection
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className={`inline-flex h-10 w-full items-center justify-center px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] transition-colors ${
              onRetry
                ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            Return to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
