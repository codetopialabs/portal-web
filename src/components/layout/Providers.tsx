"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { UserInitializer } from "@/components/auth/UserInitializer";
import { setQueryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const qc = new QueryClient();
    setQueryClient(qc);
    return qc;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <UserInitializer />
      {children}
    </QueryClientProvider>
  );
}
