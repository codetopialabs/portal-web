interface SessionLoadErrorProps {
  message: string;
  onReset: () => void;
}

export function SessionLoadError({ message, onReset }: SessionLoadErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div className="max-w-sm border border-zinc-200 bg-white p-6">
        <p className="font-sans text-lg font-black uppercase tracking-tight text-zinc-900">
          Session could not load
        </p>
        <p className="mt-2 font-mono text-xs leading-6 text-zinc-500">{message}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex h-10 items-center justify-center bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
        >
          Return to sign in
        </button>
      </div>
    </div>
  );
}
