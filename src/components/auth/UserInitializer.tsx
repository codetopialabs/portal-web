"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

export function UserInitializer() {
  const session = useAuthStore((s) => s.session);
  const fetchMe = useUserStore((s) => s.fetchMe);

  useEffect(() => {
    if (session) {
      fetchMe();
    }
  }, [session, fetchMe]);

  return null;
}
