import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton QueryClient instance shared across the app.
 *
 * Providers.tsx creates the QueryClientProvider with this instance so that
 * non-React code (e.g. Zustand store actions) can reach the cache via
 * getQueryClient() without needing to be inside a React component.
 */
let client: QueryClient | null = null;

export function setQueryClient(qc: QueryClient) {
    client = qc;
}

export function getQueryClient(): QueryClient {
    if (!client) throw new Error("QueryClient not initialised yet");
    return client;
}
