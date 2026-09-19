import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type DepartmentInput, DepartmentsService } from "@/services/departments.service";

const DEPARTMENTS_KEY = ["admin", "departments"] as const;

export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_KEY,
    queryFn: () => DepartmentsService.list(),
    staleTime: 1000 * 60,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentInput) => DepartmentsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<DepartmentInput> }) =>
      DepartmentsService.update(slug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
      // Team cards embed the department name, so a rename must reach them.
      qc.invalidateQueries({ queryKey: ["admin", "teams"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => DepartmentsService.remove(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
    },
  });
}
