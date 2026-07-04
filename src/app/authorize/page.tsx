"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMe } from "@/hooks/useMe";
import { OAuthService } from "@/services/oauth.service";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function AuthorizeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile: me } = useMe();
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => {
    return {
      clientId: searchParams.get("client_id") ?? "",
      redirectUri: searchParams.get("redirect_uri") ?? "",
      state: searchParams.get("state") ?? "",
      scope: searchParams.get("scope") ?? "read",
      codeChallenge: searchParams.get("code_challenge") ?? undefined,
      codeChallengeMethod: searchParams.get("code_challenge_method") ?? "S256",
      appName: searchParams.get("app_name") ?? "",
    };
  }, [searchParams]);

  const appLabel = useMemo(() => {
    if (params.appName) return params.appName;
    try {
      return new URL(params.redirectUri).host;
    } catch {
      return "an application";
    }
  }, [params.appName, params.redirectUri]);

  // Not logged in → bounce to login, preserving the full authorize URL.
  useEffect(() => {
    const token = getCookie("accessToken");
    const refresh = getCookie("refreshToken");
    if (!token && !refresh) {
      const here = `/authorize?${searchParams.toString()}`;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    }
  }, [router, searchParams]);

  function deny() {
    if (!params.redirectUri) {
      router.replace("/");
      return;
    }
    const sep = params.redirectUri.includes("?") ? "&" : "?";
    const denyParams = new URLSearchParams({ error: "access_denied" });
    if (params.state) denyParams.set("state", params.state);
    window.location.href = `${params.redirectUri}${sep}${denyParams.toString()}`;
  }

  async function approve() {
    if (!params.clientId || !params.redirectUri) {
      toast.error("This authorization link is missing required information.");
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = await OAuthService.authorize(params);
      window.location.href = redirectTo;
    } catch {
      toast.error("Could not complete authorization. Please try again.");
      setSubmitting(false);
    }
  }

  const missing = !params.clientId || !params.redirectUri;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4">
      <div className="w-full max-w-md border border-grey-200 bg-white p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-5 h-16 w-16">
            <Image
              src="/logos/codetopia-community.png"
              alt="Codetopia"
              fill
              sizes="64px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="font-sans text-2xl font-black text-text-primary">Authorize access</h1>
          <p className="mt-2 font-mono text-xs leading-6 text-text-tertiary">
            <span className="font-bold text-text-primary">{appLabel}</span> wants to sign you in
            with your Codetopia Community account.
          </p>
        </div>

        {me && (
          <div className="mb-6 flex items-center gap-3 border border-grey-200 bg-grey-50 p-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-icon-tertiary" />
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-bold text-text-primary">
                {me.fullName || me.username}
              </p>
              <p className="truncate font-mono text-xs text-text-muted">{me.email}</p>
            </div>
          </div>
        )}

        <div className="mb-6 border border-grey-200 p-4">
          <p className="font-mono text-xs font-medium text-text-muted">This will share</p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-text-secondary">
            <li>• Your name, username and email</li>
            <li>• Your community roles and permissions</li>
          </ul>
        </div>

        {missing ? (
          <p className="border border-error-200 bg-error-50 px-3 py-2 font-mono text-xs font-bold text-error-700">
            This authorization link is invalid or incomplete.
          </p>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={deny}
              disabled={submitting}
              className="h-11 flex-1 border border-grey-200 bg-white font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={approve}
              disabled={submitting}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-grey-900 bg-grey-900 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
          <Loader2 className="h-6 w-6 animate-spin text-grey-400" />
        </div>
      }
    >
      <AuthorizeInner />
    </Suspense>
  );
}
