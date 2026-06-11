"use client";

import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";

type State = "loading" | "confirm" | "submitting" | "success" | "error";

function DiscordLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, isLoading: authLoading } = useAuthStore();

  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token") ?? "";

  // Wait for auth to initialise from cookies, then gate on session
  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      const next = encodeURIComponent(`/discord/link?token=${token}`);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (!token) {
      setState("error");
      setMessage("Missing token. Please run /link again in Discord.");
      return;
    }

    // Check the token is still pending
    axiosInstance
      .get(`/auth/discord/status/${token}/`)
      .then((res) => {
        const status = res.data?.status ?? res.data?.data?.status;
        if (status === "pending") {
          setState("confirm");
        } else if (status === "expired") {
          setState("error");
          setMessage("This link has expired. Please run /link again in Discord.");
        } else if (status === "completed") {
          setState("error");
          setMessage("This link has already been used.");
        } else {
          setState("error");
          setMessage("Invalid link. Please run /link again in Discord.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Could not validate the link. Please try again.");
      });
  }, [authLoading, session, token, router]);

  function handleConfirm() {
    setState("submitting");
    axiosInstance
      .post("/auth/discord/confirm/", { token })
      .then(() => {
        setState("success");
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message || "Something went wrong. Please try again.");
      });
  }

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

      <div className="flex-1 flex items-start justify-center px-4 pt-32">
        <div className="w-full max-w-105 space-y-6">
          {(state === "loading" || authLoading) && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-sm text-zinc-400">Validating link…</p>
            </div>
          )}

          {state === "confirm" && (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">Connect Discord</h2>
                <p className="text-sm text-zinc-400">
                  Link your Discord account to your Codetopia portal account to unlock community
                  channels.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-sm text-zinc-300 space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Linking as</p>
                <p className="text-white font-medium">
                  {session?.accessToken ? "your portal account" : "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-white text-black text-sm font-semibold py-2.5 px-4 hover:bg-zinc-200 transition-colors"
              >
                Confirm — Connect my Discord
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-zinc-500 text-center">
                This link expires in 10 minutes and can only be used once.
              </p>
            </>
          )}

          {state === "submitting" && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-sm text-zinc-400">Linking your account…</p>
            </div>
          )}

          {state === "success" && (
            <>
              <CheckCircle className="w-10 h-10 text-green-400" />
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">You're all set!</h2>
                <p className="text-sm text-zinc-400">
                  Your Discord account is now linked to your Codetopia portal account. Head back to
                  Discord — the bot will grant you access shortly.
                </p>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="w-10 h-10 text-red-400" />
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">Something went wrong</h2>
                <p className="text-sm text-zinc-400">{message}</p>
              </div>
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-white hover:text-zinc-300 transition-colors"
              >
                Go to portal <ArrowRight className="w-3.5 h-3.5 mt-px" />
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DiscordLinkPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center font-mono text-white">
          <div className="text-sm text-zinc-400">Loading…</div>
        </main>
      }
    >
      <DiscordLinkContent />
    </Suspense>
  );
}
