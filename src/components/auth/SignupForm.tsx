"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/auth.service";
import { type SignupFormValues, useRegisterMutation } from "@/hooks/useAuthMutations";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({ mode: "onBlur" });
  const password = watch("password", "");
  const mutation = useRegisterMutation();

  function onSubmit(data: SignupFormValues) {
    mutation.mutate(data);
  }

  const inputClass =
    "bg-zinc-900 border border-zinc-700 text-white h-11 rounded-none px-4 text-sm focus-visible:ring-0 focus-visible:border-zinc-400 placeholder:text-zinc-500 transition-all duration-200";

  if (mutation.isSuccess) {
    return (
      <div className="w-full max-w-[420px]">
        <div className="space-y-4">
          <h2 className="text-2xl font-sans font-bold text-white">Check your email</h2>
          <p className="font-mono text-sm text-zinc-400">{mutation.data.detail}</p>
          <Link href="/login" className="flex items-center gap-1 font-mono text-sm text-white hover:text-zinc-300 transition-colors">
            Back to sign in <ArrowRight className="w-3.5 h-3.5 mt-px" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-sans font-bold text-white">Create Account</h2>
          <p className="font-mono text-sm text-zinc-400">Join Codetopia Community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm text-zinc-300">
                First Name
              </label>
              <Input
                id="firstName"
                placeholder="John"
                type="text"
                autoCapitalize="words"
                autoComplete="given-name"
                autoCorrect="off"
                disabled={mutation.isPending}
                className={inputClass}
                {...register("firstName", {
                  required: "Required",
                  minLength: { value: 2, message: "Min 2 characters" },
                })}
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm text-zinc-300">
                Last Name
              </label>
              <Input
                id="lastName"
                placeholder="Doe"
                type="text"
                autoCapitalize="words"
                autoComplete="family-name"
                autoCorrect="off"
                disabled={mutation.isPending}
                className={inputClass}
                {...register("lastName", {
                  required: "Required",
                  minLength: { value: 2, message: "Min 2 characters" },
                })}
              />
              {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName.message}</p>}
            </div>
          </div>

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
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                validate: async (value) => {
                  const available = await AuthService.checkEmail(value).catch(() => true);
                  return available || "Email is already taken";
                },
              })}
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm text-zinc-300">
              Username
            </label>
            <Input
              id="username"
              placeholder="johndoe"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={mutation.isPending}
              className={inputClass}
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "Min 3 characters" },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Letters, numbers and underscores only",
                },
                validate: async (value) => {
                  if (value.length < 3) return true; // let minLength handle it
                  const available = await AuthService.checkUsername(value).catch(() => true);
                  return available || "Username is already taken";
                },
              })}
            />
            {errors.username && <p className="text-red-400 text-xs">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoCorrect="off"
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

          <div className="space-y-3 pt-1">
            <p className="text-xs text-zinc-500 text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>

            {mutation.isError && <p className="text-red-400 text-xs">{mutation.error?.message}</p>}

            <Button
              disabled={mutation.isPending}
              className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-none font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700/60" />
          </div>
          <div className="relative flex justify-center text-xs text-zinc-500">
            <span className="bg-black px-3">Or sign up with</span>
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

        <p className="font-mono text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white font-medium hover:text-zinc-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
