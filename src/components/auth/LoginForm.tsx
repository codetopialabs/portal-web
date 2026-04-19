"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ArrowRight } from "lucide-react";
import { useLoginMutation, type LoginFormValues } from "@/hooks/useAuthMutations";

export function LoginForm() {
  const [step, setStep] = useState<"email" | "password">("email");
  const mutation = useLoginMutation();

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

  return (
    <div className="relative w-full max-w-[440px]">
      <div className="absolute -inset-20 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="space-y-8 relative z-20">
        <div className="space-y-2">
          <h2 className="text-3xl font-sans font-black tracking-tighter text-white uppercase">
            Sign In
          </h2>
          <p className="text-[10px] text-zinc-300 font-mono tracking-[0.1em] uppercase opacity-80">
            To continue to Codetopia Community
          </p>
        </div>

        {step === "email" ? (
          <>
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-[10px] text-zinc-300 font-mono tracking-[0.1em] uppercase"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={mutation.isPending}
                    className="bg-[#080808] border-[1px] border-zinc-700 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-white focus-visible:bg-[#0c0c0c] placeholder:text-zinc-600 transition-all duration-300"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-focus-within:w-full" />
                </div>
                {errors.email && (
                  <p className="text-red-400 font-mono text-[10px] tracking-wider">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                disabled={mutation.isPending}
                className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-none font-sans font-black text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
              >
                {mutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700/50" />
              </div>
              <div className="relative flex justify-center text-[9px] font-mono text-zinc-400 uppercase tracking-[0.3em]">
                <span className="bg-black px-4">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="bg-transparent border border-zinc-700 hover:bg-[#111] hover:text-white hover:border-zinc-500 text-zinc-300 h-12 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all group"
                disabled={mutation.isPending}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border border-zinc-700 hover:bg-[#111] hover:text-white hover:border-zinc-500 text-zinc-300 h-12 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all group"
                disabled={mutation.isPending}
              >
                <FaGithub className="mr-2 h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                Github
              </Button>
            </div>
          </>
        ) : (
          <>
            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="pb-2">
                <div
                  className="flex items-center gap-4 py-5 px-3 bg-[#0c0c0c] border border-zinc-800 transition-all cursor-pointer"
                  onClick={() => setStep("email")}
                >
                  <div className="h-10 w-10 border border-zinc-700 bg-black flex items-center justify-center font-mono text-zinc-300">
                    {getValues("email").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-mono text-xs tracking-widest truncate">
                      {getValues("email")}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1 h-1 bg-zinc-500" />
                      <span className="text-[9px] text-zinc-300 font-mono uppercase tracking-[0.2em]">
                        Switch Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-[10px] text-zinc-300 font-mono tracking-[0.1em] uppercase"
                >
                  Password
                </label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoFocus
                    disabled={mutation.isPending}
                    className="bg-[#080808] border-[1px] border-zinc-700 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-white focus-visible:bg-[#0c0c0c] placeholder:text-zinc-600 transition-all duration-300"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Min 8 characters" },
                    })}
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-focus-within:w-full" />
                </div>
                {errors.password && (
                  <p className="text-red-400 font-mono text-[10px] tracking-wider">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {mutation.isError && (
                <p className="text-red-400 font-mono text-xs tracking-wider">
                  {mutation.error?.message}
                </p>
              )}

              <Button
                disabled={mutation.isPending}
                className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-none font-sans font-black text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
              >
                {mutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}

        <div className="pt-8 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-zinc-400">
          <Link
            href="#"
            className="hover:text-white border-b border-zinc-700 hover:border-zinc-500 pb-1 transition-all"
          >
            Forgot Password?
          </Link>
          <Link
            href="/signup"
            className="hover:text-white border-b border-zinc-700 hover:border-zinc-500 pb-1 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
