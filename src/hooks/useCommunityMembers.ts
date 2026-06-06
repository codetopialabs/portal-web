"use client";

import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

export function useCommunityMembers(search?: string) {
  return useQuery({
    queryKey: ["community-members", search],
    queryFn: () => UserService.getCommunityMembers(search),
    staleTime: 60_000,
    gcTime: 300_000,
  });
}
