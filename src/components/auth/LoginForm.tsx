"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type LoginFormValues, useLoginMutation } from "@/hooks/useAuthMutations";
import { AuthService } from "@/services/auth.service";

export function LoginForm({
  sessionExpired = false,
  next,
}: {
  sessionExpired?: boolean;
  next?: string;
}) {
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useLoginMutation(next);
  const resendMutation = useMutation({
    mutationFn: (email: string) => AuthService.resendVerification(email),
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>();

  function onEmailSubmit() {
    setStep("password");
  }

  function onPasswordSubmit() {
    mutation.mutate({
      email: getValues("email"),
      password: getValues("password"),
    });
  }

  const inputClass =
    "bg-zinc-900 border border-zinc-700 text-white h-11 rounded-none px-4 text-sm focus-visible:ring-0 focus-visible:border-zinc-400 placeholder:text-zinc-500 transition-all duration-200";

  return (
    <div className="w-full max-w-[420px]">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-sans font-bold text-white">Sign In</h2>
          <p className="font-mono text-sm text-zinc-400">Continue to Codetopia Community</p>
        </div>

        {sessionExpired && (
          <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <span className="mt-px text-amber-400 shrink-0">⚠</span>
            <div>
              <p className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                Session expired
              </p>
              <p className="font-mono text-xs text-amber-400/80 mt-0.5">
                Your session has expired. Please sign in again to continue.
              </p>
            </div>
          </div>
        )}

        {step === "email" ? (
          <>
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm text-zinc-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={mutation.isPending}
                  className={inputClass}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>

              <Button
                disabled={mutation.isPending}
                className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-none font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700/60" />
              </div>
              <div className="relative flex justify-center text-xs text-zinc-500">
                <span className="bg-black px-3">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-200 h-11 rounded-none text-sm font-medium transition-all"
                disabled={mutation.isPending}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-200 h-11 rounded-none text-sm font-medium transition-all"
                disabled={mutation.isPending}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(onPasswordSubmit)}
            className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 p-3 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-all"
              onClick={() => setStep("email")}
            >
              <div className="h-9 w-9 rounded-full bg-zinc-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {getValues("email").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-white text-sm truncate">{getValues("email")}</span>
                <span className="font-mono text-xs text-zinc-400 mt-0.5">Switch account</span>
              </div>
            </button>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
            </div>

            {mutation.isError &&
              ((mutation.error as Error & { code?: string })?.code === "email_not_verified" ? (
                <div className="space-y-2 p-3 bg-zinc-900 border border-zinc-700">
                  <p className="text-yellow-400 text-xs">Your email isn't verified yet.</p>
                  {resendMutation.isSuccess ? (
                    <p className="text-emerald-400 text-xs">Verification email sent.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => resendMutation.mutate(getValues("email"))}
                      disabled={resendMutation.isPending}
                      className="text-xs text-white underline underline-offset-2 hover:text-zinc-300 transition-colors disabled:opacity-50"
                    >
                      {resendMutation.isPending ? "Sending…" : "Resend verification email"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-red-400 text-xs">{mutation.error?.message}</p>
              ))}

            <Button
              disabled={mutation.isPending}
              className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-none font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

        <div className="flex items-center justify-between font-mono text-sm text-zinc-400">
          <Link href="/forgot-password" className="hover:text-white transition-colors">
            Forgot password?
          </Link>
          <Link href="/signup" className="hover:text-white transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
