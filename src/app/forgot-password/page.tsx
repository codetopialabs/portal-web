"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const mutation = useMutation({
    mutationFn: (email: string) => AuthService.passwordReset(email),
  });

  const inputClass =
    "bg-zinc-900 border border-zinc-700 text-white h-11 rounded-none px-4 text-sm focus-visible:ring-0 focus-visible:border-zinc-400 placeholder:text-zinc-500 transition-all duration-200";

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
          {mutation.isSuccess ? (
            <>
              <h2 className="text-2xl font-sans font-bold text-white">Check your email</h2>
              <p className="text-sm text-zinc-400">{mutation.data.detail}</p>
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-white hover:text-zinc-300 transition-colors"
              >
                Back to sign in <ArrowRight className="w-3.5 h-3.5 mt-px" />
              </Link>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-sans font-bold text-white">Forgot password</h2>
                <p className="text-sm text-zinc-400">
                  Enter your email and we'll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d.email))} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm text-zinc-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
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

                {mutation.isError && (
                  <p className="text-red-400 text-xs">{mutation.error?.message}</p>
                )}

                <Button
                  disabled={mutation.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-none font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      Send reset link <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>

              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Back to sign in <ArrowRight className="w-3.5 h-3.5 mt-px" />
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
