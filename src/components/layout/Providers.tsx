"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { UserInitializer } from "@/components/auth/UserInitializer";
import { setQueryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          // Treat cached data as fresh for 30 s by default. Queries that need
          // tighter freshness (live feeds, invite lists) override this locally.
          // Without this the default is 0 ms — every window focus and component
          // mount triggers a network request even when nothing has changed.
          staleTime: 30_000,
          // Do not refetch on window focus by default. Queries that genuinely
          // need live updates (useMe, useAdminOverview) already use
          // refetchInterval and do not need the extra focus-triggered round-trip.
          refetchOnWindowFocus: false,
          // Keep unused cache entries for 5 minutes (React Query default).
          gcTime: 5 * 60 * 1000,
        },
      },
    });
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
