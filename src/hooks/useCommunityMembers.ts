"use client";

import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

export function useCommunityMembers(
  search?: string,
  options?: { onboardedOnly?: boolean; excludeFlagged?: boolean }
) {
  const onboardedOnly = options?.onboardedOnly ?? false;
  const excludeFlagged = options?.excludeFlagged ?? false;
  return useQuery({
    queryKey: ["community-members", search, onboardedOnly, excludeFlagged],
    queryFn: () => UserService.getCommunityMembers(search, { onboardedOnly, excludeFlagged }),
    staleTime: 60_000,
    gcTime: 300_000,
  });
}
