/**
 * API configuration.
 *
 * - `apiFetch<T>()` — generic client-side fetch wrapper that unwraps
 *   the standard `ApiResponse<T>` envelope returned by our Next.js route handlers.
 */

import type { ApiResponse } from "@/types/shared/api-response";

/**
 * Generic fetch wrapper that handles the standard ApiResponse envelope.
 *
 * 1. Sends the request.
 * 2. Asserts `response.ok`.
 * 3. Unwraps `ApiResponse<T>`, throwing on `success === false`.
 * 4. Returns the typed `data` payload.
 *
 * @param url - The endpoint URL.
 * @param options - Standard `RequestInit` options.
 * @returns The unwrapped `data` of type `T`.
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    let message = fallback;

    try {
      const body = (await response.json()) as { error?: string };
      message = body?.error ?? fallback;
    } catch {
      /* body wasn't JSON — keep fallback */
    }

    throw new Error(message);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.message ?? "An unknown error occurred.");
  }

  return json.data as T;
}
