interface AuthState {
  token: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  user: Record<string, unknown> | null;
  permissions: unknown[] | null;
}
