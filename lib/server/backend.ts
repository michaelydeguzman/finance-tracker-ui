import { auth } from "@/auth";

export { isUuid } from "@/lib/uuid";

/**
 * Base URL of the .NET backend, without a trailing slash.
 * Throws rather than letting `undefined` be interpolated into a fetch URL.
 */
export function backendBaseUrl(): string {
  const url = process.env.API_URL;

  if (!url) {
    throw new Error("API_URL is not configured.");
  }

  return url.replace(/\/+$/, "");
}

/**
 * Rejects unauthenticated callers. The middleware already gates `/api/*`, but
 * these handlers proxy straight to a backend that has no auth of its own, so
 * they re-check rather than trusting a single layer.
 *
 * @returns a 401 `Response` to return immediately, or `null` when authorized.
 */
export async function requireSession(): Promise<Response | null> {
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  return null;
}

/** Client-safe messages for backend failures — never the backend's own body. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was rejected as invalid.",
  401: "Not authorized to perform this action.",
  403: "Not authorized to perform this action.",
  404: "The requested record was not found.",
  409: "That change conflicts with an existing record.",
};

const safeMessage = (status: number): string =>
  STATUS_MESSAGES[status] ??
  (status >= 500
    ? "The finance service is unavailable. Please try again."
    : "The request could not be completed.");

export type BackendResult =
  | { ok: true; data: unknown }
  | { ok: false; response: Response };

/**
 * Calls the backend and normalizes failures.
 *
 * Backend response bodies and thrown exception messages are logged server-side
 * and never forwarded to the browser — they leak internal hostnames, SQL, and
 * stack details.
 */
export async function callBackend(
  path: string,
  init?: RequestInit,
): Promise<BackendResult> {
  const url = `${backendBaseUrl()}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const detail = await response.text().catch(() => "<unreadable body>");
    console.error(
      `[backend] ${init?.method ?? "GET"} ${path} -> ${response.status}: ${detail}`,
    );

    return {
      ok: false,
      response: Response.json(
        { error: safeMessage(response.status) },
        { status: response.status },
      ),
    };
  }

  if (response.status === 204) {
    return { ok: true, data: null };
  }

  return { ok: true, data: await response.json() };
}

/** Logs an unexpected handler failure and returns an opaque 500. */
export function routeError(context: string, reason: unknown): Response {
  console.error(`[${context}] Unhandled failure:`, reason);

  return Response.json({ error: "Unexpected server error." }, { status: 500 });
}

/** Guards JSON-bodied verbs; returns a 415 `Response` when the type is wrong. */
export function requireJsonContentType(request: Request): Response | null {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  return null;
}
