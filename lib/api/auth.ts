/**
 * Auth API client. Route handlers may return `{ success, data }` envelopes;
 * `apiFetch` unwraps `data` on success. On HTTP errors, handlers should send
 * `{ message: string }` or `{ error: string }` (see `apiFetch` non-OK branch).
 */
import { apiFetch } from "@/lib/api/config";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints/auth";

export type LoginRequest = { email: string; password: string };

export type SignupRequest = { email: string; password: string };

export async function login(request: LoginRequest): Promise<unknown> {
  return apiFetch(AUTH_ENDPOINTS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export async function signup(request: SignupRequest): Promise<unknown> {
  return apiFetch(AUTH_ENDPOINTS.signup, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}
