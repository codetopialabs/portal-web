"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReflectionsService } from "@/services/reflections.service";
import type { ReflectionQuestionInput } from "@/types/reflections.types";

export const reflectionKeys = {
  current: ["reflections", "current"] as const,
  list: (params?: { period?: string; status?: string }) => ["reflections", "list", params] as const,
  detail: (id: string) => ["reflections", id] as const,
  questions: ["reflections", "questions"] as const,
  historyMe: ["reflections", "history", "me"] as const,
  member: (username: string) => ["reflections", "member", username] as const,
  settings: ["reflections", "settings"] as const,
  upcoming: ["reflections", "upcoming"] as const,
};

export function useCurrentReflection(enabled = true) {
  return useQuery({
    queryKey: reflectionKeys.current,
    queryFn: () => ReflectionsService.getCurrent(),
    enabled,
  });
}

export function useSubmitReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      answers,
      attachments,
    }: {
      answers: Record<string, string>;
      attachments: Record<string, string[]>;
    }) => ReflectionsService.submit(answers, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.current });
      queryClient.invalidateQueries({ queryKey: reflectionKeys.historyMe });
    },
  });
}

export function useUploadReflectionAttachment() {
  return useMutation({
    mutationFn: (file: File) => ReflectionsService.uploadAttachment(file),
  });
}

export function useReflections(params?: { period?: string; status?: string }) {
  return useQuery({
    queryKey: reflectionKeys.list(params),
    queryFn: () => ReflectionsService.list(params),
  });
}

export function useMyReflections() {
  return useQuery({
    queryKey: reflectionKeys.historyMe,
    queryFn: () => ReflectionsService.listOwn(),
  });
}

export function useReflectionsByMember(username: string) {
  return useQuery({
    queryKey: reflectionKeys.member(username),
    queryFn: () => ReflectionsService.listByUser(username),
    enabled: !!username,
  });
}

export function useReviewReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      notes,
    }: {
      id: string;
      action: "approve" | "request_changes";
      notes?: Record<string, string>;
    }) => ReflectionsService.review(id, action, notes),
    onSuccess: (_data, { id }) => {
      // Bust the list views (prefix match covers all param variants)
      queryClient.invalidateQueries({ queryKey: ["reflections", "list"] });
      // Bust the specific reflection detail
      queryClient.invalidateQueries({ queryKey: reflectionKeys.detail(id) });
      // Bust all per-member history views — we don't know which member was
      // reviewed here so we use the shared prefix to invalidate all of them.
      queryClient.invalidateQueries({ queryKey: ["reflections", "member"] });
    },
  });
}

export function useReflectionQuestions() {
  return useQuery({
    queryKey: reflectionKeys.questions,
    queryFn: () => ReflectionsService.getQuestions(),
  });
}

export function useCreateReflectionQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReflectionQuestionInput) => ReflectionsService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.questions });
      // Current cycle view shows the active questions — refresh it too.
      queryClient.invalidateQueries({ queryKey: reflectionKeys.current });
    },
  });
}

export function useUpdateReflectionQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReflectionQuestionInput> }) =>
      ReflectionsService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.questions });
      queryClient.invalidateQueries({ queryKey: reflectionKeys.current });
    },
  });
}

export function useDeleteReflectionQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReflectionsService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.questions });
      queryClient.invalidateQueries({ queryKey: reflectionKeys.current });
    },
  });
}

export function useReflectionSettings() {
  return useQuery({
    queryKey: reflectionKeys.settings,
    queryFn: () => ReflectionsService.getSettings(),
  });
}

export function useUpdateReflectionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ openDay: number; windowDays: number }>) =>
      ReflectionsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.settings });
      // Cycle timing changes affect the upcoming cycle display too.
      queryClient.invalidateQueries({ queryKey: reflectionKeys.upcoming });
    },
  });
}

export function useTriggerReflectionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ReflectionsService.triggerCycle(),
    onSuccess: () => {
      // A new cycle was triggered — invalidate everything cycle-related so
      // the settings page, upcoming panel, and current-cycle view all refresh.
      queryClient.invalidateQueries({ queryKey: reflectionKeys.upcoming });
      queryClient.invalidateQueries({ queryKey: reflectionKeys.current });
      queryClient.invalidateQueries({ queryKey: reflectionKeys.settings });
    },
  });
}

export function useUpcomingCycle() {
  return useQuery({
    queryKey: reflectionKeys.upcoming,
    queryFn: () => ReflectionsService.getUpcomingCycle(),
  });
}

export function useConfirmReflectionQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ReflectionsService.confirmQuestions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.upcoming });
    },
  });
}
