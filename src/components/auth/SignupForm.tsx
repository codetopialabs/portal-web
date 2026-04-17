"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Mail } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.target as HTMLFormElement);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black">
      <Card className="w-full max-w-md border border-zinc-800 rounded-none bg-[#0a0a0a] text-white">
        <CardHeader className="space-y-4 text-center pt-10">
          <div className="mx-auto bg-white text-black p-4 rounded-none w-16 h-16 flex items-center justify-center">
            <UserPlus size={32} />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase font-sans">Sign Up</CardTitle>
          <CardDescription className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">
            Enter details to register
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-white font-mono text-xs uppercase tracking-widest">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="border border-zinc-800 bg-black focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 h-14 rounded-none px-4 font-mono placeholder:text-zinc-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white font-mono text-xs uppercase tracking-widest">Email address</Label>
                <Input
                  id="email"
                  placeholder="john@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="border border-zinc-800 bg-black focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 h-14 rounded-none px-4 font-mono placeholder:text-zinc-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" title="password" className="text-white font-mono text-xs uppercase tracking-widest">Password</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  disabled={isLoading}
                  className="border border-zinc-800 bg-black focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 h-14 rounded-none px-4 font-mono placeholder:text-zinc-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" title="confirm-password" className="text-white font-mono text-xs uppercase tracking-widest">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  placeholder="••••••••"
                  type="password"
                  disabled={isLoading}
                  className="border border-zinc-800 bg-black focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 h-14 rounded-none px-4 font-mono placeholder:text-zinc-700"
                  required
                />
              </div>
              
              <div className="relative group w-full mt-4">
                <div className="absolute inset-0 border border-white translate-x-[4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
                <Button disabled={isLoading} className="relative z-10 w-full bg-black text-white border border-white hover:bg-zinc-900 h-14 text-sm font-bold uppercase tracking-widest rounded-none transition-colors">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                      Creating...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </div>
          </form>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-mono">
              <span className="bg-[#0a0a0a] px-4 text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button variant="outline" className="border border-zinc-800 bg-transparent hover:bg-white hover:text-black h-14 rounded-none font-mono text-xs uppercase tracking-widest transition-colors" disabled={isLoading}>
              <FaGithub className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button variant="outline" className="border border-zinc-800 bg-transparent hover:bg-white hover:text-black h-14 rounded-none font-mono text-xs uppercase tracking-widest transition-colors" disabled={isLoading}>
              <FaGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center pb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-zinc-300 transition-colors"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
