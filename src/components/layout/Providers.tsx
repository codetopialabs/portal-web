"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { UserInitializer } from "@/components/auth/UserInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <UserInitializer />
      {children}
    </QueryClientProvider>
  );
}
