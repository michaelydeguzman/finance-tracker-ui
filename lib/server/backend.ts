import { getToken } from "next-auth/jwt";

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

/** The bearer token a proxied call travels with, once the caller is known to be signed in. */
export interface AuthorizedCaller {
  accessToken: string;
}

export type SessionCheck =
  | { ok: true; caller: AuthorizedCaller }
  | { ok: false; response: Response };

const unauthorized = (): Response =>
  Response.json({ error: "Authentication required." }, { status: 401 });

/**
 * Rejects unauthenticated callers and hands back the token the backend will be called with.
 *
 * Read straight from the encrypted session cookie rather than from `auth()`, because the
 * access token is deliberately absent from the session object — exposing it there would
 * serve it to the browser through `/api/auth/session`.
 *
 * The middleware already gates `/api/*`, but the backend now trusts a bearer token rather
 * than the caller's position on the network, so these handlers still have to produce one.
 */
export async function requireSession(request: Request): Promise<SessionCheck> {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    console.error(
      "[backend] AUTH_SECRET is not configured; cannot read the session.",
    );
    return { ok: false, response: unauthorized() };
  }

  const token = await getToken({
    req: request,
    secret,
    // Matches the cookie name Auth.js writes, which is prefixed only over HTTPS.
    secureCookie: (
      process.env.NEXTAUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      ""
    ).startsWith("https://"),
  });

  const accessToken = token?.apiSession?.accessToken;

  // No token, or a session whose API credentials could not be renewed. Either way the
  // caller has to sign in again; the reason is logged, not returned.
  if (!accessToken) {
    if (token?.error) {
      console.error(`[backend] session present but unusable: ${token.error}`);
    }

    return { ok: false, response: unauthorized() };
  }

  return { ok: true, caller: { accessToken } };
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
  init: RequestInit | undefined,
  caller: AuthorizedCaller,
): Promise<BackendResult> {
  const url = `${backendBaseUrl()}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${caller.accessToken}`,
    },
  });

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
