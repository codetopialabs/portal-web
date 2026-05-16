"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/auth.service";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{ password: string; confirm: string }>();
  const password = watch("password", "");

  const token = searchParams.get("token");

  const mutation = useMutation({
    mutationFn: (password: string) => AuthService.confirmPasswordReset(token!, password),
    onSuccess: () => setTimeout(() => router.push("/login"), 3000),
  });

  const inputClass =
    "bg-zinc-900 border border-zinc-700 text-white h-11 rounded-none px-4 text-sm focus-visible:ring-0 focus-visible:border-zinc-400 placeholder:text-zinc-500 transition-all duration-200";

  if (!token) {
    return (
      <main className="min-h-screen bg-black flex flex-col font-mono text-white">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-[420px] space-y-4">
            <h2 className="text-2xl font-sans font-bold text-white">Invalid link</h2>
            <p className="text-sm text-zinc-400">This password reset link is invalid or has expired.</p>
            <Link href="/forgot-password" className="flex items-center gap-1 text-sm text-white hover:text-zinc-300 transition-colors">
              Request a new link <ArrowRight className="w-3.5 h-3.5 mt-px" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col font-mono text-white">
      <header className="sticky top-0 z-50 flex items-center px-8 py-6 w-full bg-black/60 backdrop-blur-md border-b border-white/5">
        <Image src="/logos/codetopia-community.png" alt="Codetopia Community Logo" width={180} height={48} className="object-contain h-8 w-auto" priority />
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] space-y-6">
          {mutation.isSuccess ? (
            <>
              <h2 className="text-2xl font-sans font-bold text-white">Password reset</h2>
              <p className="text-sm text-zinc-400">{mutation.data.detail}</p>
              <p className="text-xs text-zinc-500">Redirecting to sign in…</p>
              <Link href="/login" className="flex items-center gap-1 text-sm text-white hover:text-zinc-300 transition-colors">
                Sign in now <ArrowRight className="w-3.5 h-3.5 mt-px" />
              </Link>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">Reset password</h2>
                <p className="text-sm text-zinc-400">Enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d.password))} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm text-zinc-300">New Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                      disabled={mutation.isPending}
                      className={`${inputClass} pr-10`}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Min 8 characters" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                  <PasswordStrengthMeter password={password} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm" className="block text-sm text-zinc-300">Confirm Password</label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={mutation.isPending}
                      className={`${inputClass} pr-10`}
                      {...register("confirm", {
                        required: "Please confirm your password",
                        validate: (v) => v === password || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm.message}</p>}
                </div>

                {mutation.isError && <p className="text-red-400 text-xs">{mutation.error?.message}</p>}

                <Button disabled={mutation.isPending} className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-none font-semibold text-sm flex items-center justify-center gap-2">
                  {mutation.isPending
                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    : <>Reset password <ArrowRight className="w-3.5 h-3.5" /></>}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center font-mono text-white">
          <div className="text-sm text-zinc-400">Loading...</div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
