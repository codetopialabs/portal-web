"use client";

import { ArrowLeft, Home, Lock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PermissionDeniedProps {
  permission?: string;
}

export function PermissionDenied({ permission }: PermissionDeniedProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      {/* AWS-style industrial lock icon */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-none bg-destructive/10 blur-xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-none border-2 border-destructive/30 bg-background/50 shadow-2xl backdrop-blur-sm">
          <Lock className="h-12 w-12 text-destructive" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-none border-2 border-background bg-destructive shadow-lg">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Access Restricted
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          You don't have the necessary clearance to view this resource.
          <br />
          <span className="mt-2 block font-mono text-xs uppercase tracking-widest text-destructive/70">
            Required: {permission || "Higher Privilege"}
          </span>
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          className="group border-muted-foreground/20 hover:border-foreground/40"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Go Back
        </Button>
        <Button
          size="lg"
          onClick={() => router.push("/")}
          className="bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all"
        >
          <Home className="mr-2 h-4 w-4" />
          Return Dashboard
        </Button>
      </div>

      {/* Industrial details */}
      <div className="mt-16 pt-8 border-t border-muted/20 w-full max-w-lg opacity-40">
        <div className="grid grid-cols-2 gap-8 text-[10px] uppercase tracking-tighter text-muted-foreground font-mono">
          <div className="text-left">
            <p>Status: 403 Forbidden</p>
            <p>Security Protocol: CT-RBAC-01</p>
          </div>
          <div className="text-right">
            <p>Access Attempt: Logged</p>
            <p>Location: Restricted Sector</p>
          </div>
        </div>
      </div>
    </div>
  );
}
