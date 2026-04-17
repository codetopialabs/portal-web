"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="relative w-full max-w-[440px]">
      <div className="space-y-8 relative z-20">
        <div className="space-y-2">
          <h2 className="text-3xl font-sans font-black tracking-tighter text-white uppercase">
            Create Account
          </h2>
          <p className="text-[10px] text-zinc-400 font-mono tracking-[0.1em] uppercase">
            Join the Codetopia Community
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="firstName" className="block text-[10px] text-zinc-400 font-mono tracking-[0.1em] uppercase">
                First Name
              </label>
              <Input
                id="firstName"
                placeholder="John"
                type="text"
                autoCapitalize="words"
                autoComplete="given-name"
                autoCorrect="off"
                disabled={isLoading}
                className="bg-[#050505] border-[1px] border-zinc-800 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-zinc-500 placeholder:text-zinc-700 transition-colors"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="lastName" className="block text-[10px] text-zinc-400 font-mono tracking-[0.1em] uppercase">
                Last Name
              </label>
              <Input
                id="lastName"
                placeholder="Doe"
                type="text"
                autoCapitalize="words"
                autoComplete="family-name"
                autoCorrect="off"
                disabled={isLoading}
                className="bg-[#050505] border-[1px] border-zinc-800 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-zinc-500 placeholder:text-zinc-700 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="email" className="block text-[10px] text-zinc-400 font-mono tracking-[0.1em] uppercase">
              Email Address
            </label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="bg-[#050505] border-[1px] border-zinc-800 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-zinc-500 placeholder:text-zinc-700 transition-colors"
              required
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="password" className="block text-[10px] text-zinc-400 font-mono tracking-[0.1em] uppercase">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoCorrect="off"
                disabled={isLoading}
                className="bg-[#050505] border-[1px] border-zinc-800 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-zinc-500 placeholder:text-zinc-700 transition-colors pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 font-mono tracking-wider leading-relaxed text-center px-4">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-zinc-400 hover:text-white border-b border-zinc-800 hover:border-zinc-500 transition-all">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-zinc-400 hover:text-white border-b border-zinc-800 hover:border-zinc-500 transition-all">Privacy Policy</Link>.
            </div>

            <Button
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-none font-sans font-black text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800/80" />
          </div>
          <div className="relative flex justify-center text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
            <span className="bg-black px-4">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="bg-transparent border border-zinc-800 hover:bg-[#111] hover:text-white hover:border-zinc-600 text-zinc-400 h-12 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all group"
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border border-zinc-800 hover:bg-[#111] hover:text-white hover:border-zinc-600 text-zinc-400 h-12 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all group"
            disabled={isLoading}
          >
            <FaGithub className="mr-2 h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
            Github
          </Button>
        </div>

        <div className="pt-8 flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          <span className="mr-3">Already have an account?</span>
          <Link href="/login" className="hover:text-white border-b border-zinc-800 hover:border-zinc-500 pb-1 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
