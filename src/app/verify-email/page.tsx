"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthService } from "@/services/auth.service";

type State = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage("Invalid verification link.");
      return;
    }

    AuthService.verifyEmail(token)
      .then((res) => {
        setState("success");
        setMessage(res.detail);
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message);
      });
  }, [searchParams, router]);

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
        <div className="w-full max-w-[420px] space-y-4">
          {state === "loading" && (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-sm text-zinc-400">Verifying your email…</p>
            </>
          )}

          {state === "success" && (
            <>
              <h2 className="text-2xl font-sans font-bold text-white">Email verified</h2>
              <p className="text-sm text-zinc-400">{message}</p>
              <p className="text-xs text-zinc-500">Redirecting to sign in…</p>
              <Link href="/login" className="flex items-center gap-1 text-sm text-white hover:text-zinc-300 transition-colors">
                Sign in now <ArrowRight className="w-3.5 h-3.5 mt-px" />
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <h2 className="text-2xl font-sans font-bold text-white">Verification failed</h2>
              <p className="text-sm text-zinc-400">{message}</p>
              <Link href="/login" className="flex items-center gap-1 text-sm text-white hover:text-zinc-300 transition-colors">
                Back to sign in <ArrowRight className="w-3.5 h-3.5 mt-px" />
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
