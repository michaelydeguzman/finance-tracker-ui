/**
 * API configuration.
 *
 * - `apiFetch<T>()` — generic client-side fetch wrapper that unwraps
 *   the standard `ApiResponse<T>` envelope returned by our Next.js route handlers.
 */

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
      const body = (await response.json()) as {
        error?: string;
        message?: string;
      };
      message = body?.error ?? body?.message ?? fallback;
    } catch {
      /* body wasn't JSON — keep fallback */
    }

    throw new Error(message);
  }

  // 204 No Content (e.g. DELETE) — no body to parse.
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  const json: unknown = await response.json();

  if (Array.isArray(json)) {
    return json as T;
  }

  if (json !== null && typeof json === "object") {
    const o = json as {
      success?: boolean;
      message?: string | null;
      data?: unknown;
    };
    if (o.success === false) {
      throw new Error(o.message ?? "An unknown error occurred.");
    }
    if ("data" in o) {
      return o.data as T;
    }
  }

  return json as T;
}
