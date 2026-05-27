export interface ApiResponse<T> {
  data: T;
  errors: unknown;
  meta: unknown;
}
