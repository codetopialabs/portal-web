"use client";

import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

export function useCommunityMembers(search?: string, options?: { onboardedOnly?: boolean }) {
  const onboardedOnly = options?.onboardedOnly ?? false;
  return useQuery({
    queryKey: ["community-members", search, onboardedOnly],
    queryFn: () => UserService.getCommunityMembers(search, { onboardedOnly }),
    staleTime: 60_000,
    gcTime: 300_000,
  });
}
