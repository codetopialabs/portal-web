"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useUserStore } from "@/store/user.store";
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
  confirmPassword?: string;
}

export function useLoginMutation() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: LoginFormValues) => AuthService.login(data),
    onSuccess: (tokens) => {
      setSession(tokens);
      if (!tokens.isOnboarded) {
        useOnboardingStore.getState().reset();
      }
      router.push(tokens.isOnboarded ? "/" : "/onboarding");
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: SignupFormValues) =>
      AuthService.register({
        email: data.email,
        username: data.username,
        full_name: `${data.firstName} ${data.lastName}`,
        password: data.password,
      }),
    onSuccess: () => {
      useOnboardingStore.getState().reset();
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
      useUserStore.getState().reset();
      useOnboardingStore.getState().reset();

      // Clear walkthrough local storage cache so a different logged-in user on the same device starts fresh
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("codetopia_walkthrough_")) {
          localStorage.removeItem(key);
        }
      }

      router.push("/login");
    },
  });
}
