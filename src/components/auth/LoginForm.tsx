"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGithub, FaGoogle } from "react-icons/fa";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="w-full max-w-[360px] space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 border border-zinc-800 rounded-xl flex items-center justify-center bg-zinc-950 shadow-inner">
               <span className="font-sans font-bold text-lg scale-y-125 text-white">/</span>
            </div>
          </div>
          <h1 className="text-2xl font-sans font-medium text-white tracking-tight">Log in to Codetopia</h1>
          <p className="text-sm text-zinc-500 font-mono tracking-wide">Enter your email to sign in</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="bg-[#0a0a0a] border-zinc-800 text-white h-12 rounded-lg px-4 font-mono focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-transparent placeholder:text-zinc-600 transition-colors"
              required
            />
          </div>
          
          <Button 
            disabled={isLoading} 
            className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-lg font-medium font-sans text-sm transition-colors"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              "Continue with Email"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="bg-black px-4">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="bg-[#0a0a0a] border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white h-12 rounded-lg font-sans text-sm font-medium transition-colors" 
            disabled={isLoading}
          >
            <FaGithub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button 
            variant="outline" 
            className="bg-[#0a0a0a] border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white h-12 rounded-lg font-sans text-sm font-medium transition-colors" 
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>

        <div className="pt-6 text-center">
          <p className="text-xs font-mono tracking-wide text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:text-zinc-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
