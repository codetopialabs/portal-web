"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate a check or just transition
    setTimeout(() => {
      setIsLoading(false);
      setStep("password");
    }, 600);
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Logging in with:", { email, password });
    }, 2000);
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
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-[10px] text-zinc-300 font-mono tracking-[0.1em] uppercase">
                  Email Address
                </label>
                <div className="relative group">
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="bg-[#080808] border-[1px] border-zinc-700 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-white focus-visible:bg-[#0c0c0c] placeholder:text-zinc-600 transition-all duration-300"
                    required
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-focus-within:w-full" />
                </div>
              </div>

              <Button
                disabled={isLoading || !email}
                className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-none font-sans font-black text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
              >
                {isLoading ? (
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
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border border-zinc-700 hover:bg-[#111] hover:text-white hover:border-zinc-500 text-zinc-300 h-12 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all group"
                disabled={isLoading}
              >
                <FaGithub className="mr-2 h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                Github
              </Button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="pb-2">
                <div className="flex items-center gap-4 py-5 px-3 bg-[#0c0c0c] border border-zinc-800 transition-all cursor-pointer" onClick={() => setStep("email")}>
                  <div className="h-10 w-10 border border-zinc-700 bg-black flex items-center justify-center font-mono text-zinc-300">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-mono text-xs tracking-widest truncate">{email}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1 h-1 bg-zinc-500" />
                      <span className="text-[9px] text-zinc-300 font-mono uppercase tracking-[0.2em]">Switch Account</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-[10px] text-zinc-300 font-mono tracking-[0.1em] uppercase">
                  Password
                </label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    disabled={isLoading}
                    className="bg-[#080808] border-[1px] border-zinc-700 text-white h-12 rounded-none px-4 font-mono text-xs tracking-widest focus-visible:ring-0 focus-visible:border-white focus-visible:bg-[#0c0c0c] placeholder:text-zinc-600 transition-all duration-300"
                    required
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-focus-within:w-full" />
                </div>
              </div>

              <Button
                disabled={isLoading || !password}
                className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-none font-sans font-black text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
              >
                {isLoading ? (
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
          <Link href="#" className="hover:text-white border-b border-zinc-700 hover:border-zinc-500 pb-1 transition-all">
            Forgot Password?
          </Link>
          <Link href="/signup" className="hover:text-white border-b border-zinc-700 hover:border-zinc-500 pb-1 transition-all">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

