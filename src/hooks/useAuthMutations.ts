"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

// Login form values (used by LoginForm)
export interface LoginFormValues {
  email: string;
  password: string;
}

// Register form values (used by SignupForm)
export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export function useLoginMutation() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: LoginFormValues) => AuthService.login(data),
    onSuccess: (tokens) => {
      setSession(tokens);
      router.push(tokens.isOnboarded ? "/" : "/onboarding");
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: SignupFormValues) =>
      AuthService.register({
        email: data.email,
        username: data.username,
        full_name: `${data.firstName} ${data.lastName}`,
        password: data.password,
      }),
    onSuccess: (tokens) => {
      setSession(tokens);
      router.push("/");
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: () => AuthService.logout(session?.accessToken ?? ""),
    onSettled: () => {
      clearSession();
      router.push("/login");
    },
  });
}
