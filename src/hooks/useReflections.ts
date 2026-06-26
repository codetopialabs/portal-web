"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReflectionsService } from "@/services/reflections.service";
import type { ReflectionQuestionInput } from "@/types/reflections.types";

export const reflectionKeys = {
  current: ["reflections", "current"] as const,
  list: (params?: { period?: string; status?: string }) => ["reflections", "list", params] as const,
  detail: (id: string) => ["reflections", id] as const,
  questions: ["reflections", "questions"] as const,
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
    mutationFn: (answers: Record<string, string>) => ReflectionsService.submit(answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reflectionKeys.current });
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
      notes?: string;
    }) => ReflectionsService.review(id, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflections", "list"] });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reflectionKeys.questions }),
  });
}

export function useUpdateReflectionQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReflectionQuestionInput> }) =>
      ReflectionsService.updateQuestion(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reflectionKeys.questions }),
  });
}

export function useDeleteReflectionQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReflectionsService.deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reflectionKeys.questions }),
  });
}
