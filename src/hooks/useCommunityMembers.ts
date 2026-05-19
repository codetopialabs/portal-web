"use client";

import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";

export function useCommunityMembers() {
  return useQuery({
    queryKey: ["community-members"],
    queryFn: () => UserService.getCommunityMembers(),
    staleTime: 60_000,
    gcTime: 300_000,
  });
}
