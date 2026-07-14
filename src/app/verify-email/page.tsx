"use client";

import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";

type State = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  // Verification is its own effect, with no timer -- `cancelled` just
  // guards against a late response calling setState after unmount.
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage("Invalid verification link.");
      return;
    }

    let cancelled = false;

    AuthService.verifyEmail(token)
      .then((res) => {
        if (cancelled) return;
        setState("success");
        setMessage(res.detail);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState("error");
        setMessage(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Separate effect for the post-success redirect timer, so it's a plain
  // synchronous setTimeout/clearTimeout pair with nothing async in between.
  useEffect(() => {
    if (state !== "success") return;
    const redirectTimeout = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(redirectTimeout);
  }, [state, router]);

  return (
    <main className="min-h-screen bg-black flex flex-col font-mono text-white">
      <header className="sticky top-0 z-50 flex items-center px-8 py-6 w-full bg-black/60 backdrop-blur-md border-b border-white/5">
        <Image
          src="/logos/codetopia-community.png"
          alt="Codetopia Community Logo"
          width={180}
          height={48}
          className="object-contain h-8 w-auto"
          priority
        />
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] space-y-6">
          {state === "loading" && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-sm text-zinc-400">Verifying your email…</p>
            </div>
          )}

          {state === "success" && (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">Email verified</h2>
                <p className="text-sm text-zinc-400">{message}</p>
                <p className="text-xs text-zinc-500">Redirecting to sign in…</p>
              </div>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-white text-black text-sm font-semibold py-2.5 px-4 hover:bg-zinc-200 transition-colors"
              >
                Sign in now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">Verification failed</h2>
                <p className="text-sm text-zinc-400">{message}</p>
              </div>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 text-sm font-medium text-white py-2.5 px-4 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                Back to sign in <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center font-mono text-white">
          <div className="text-sm text-zinc-400">Loading...</div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
