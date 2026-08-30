import { getToken } from "next-auth/jwt";
import { isUuid } from "@/lib/uuid";

export { isUuid };

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

  const token = await readSessionToken(request, secret);
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

/**
 * Decodes the Auth.js session cookie.
 *
 * The cookie name is prefixed with `__Secure-` only over HTTPS, and Auth.js decides that
 * from the *request* it wrote the cookie on. Inferring it from an environment variable
 * instead gets it wrong behind a TLS-terminating proxy, where the app sees plain HTTP —
 * and a wrong name means the cookie is simply not found, so a signed-in user gets 401 on
 * every call with nothing to explain it.
 *
 * The forwarded protocol is the best available signal, and the other name is tried as a
 * fallback rather than assumed away. A miss costs one failed decode, not a broken session.
 */
async function readSessionToken(request: Request, secret: string) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const likelySecure = forwardedProto
    ? forwardedProto.split(",")[0]?.trim() === "https"
    : new URL(request.url).protocol === "https:";

  return (
    (await getToken({ req: request, secret, secureCookie: likelySecure })) ??
    (await getToken({ req: request, secret, secureCookie: !likelySecure }))
  );
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

/** Resolved dynamic segments — `{ id }` for a `[id]` route, `{}` for a static one. */
export type RouteParams = Record<string, string>;

export interface RouteArgs<P extends RouteParams> {
  request: Request;
  /** The bearer token this call travels with. Pass it to `callBackend`. */
  caller: AuthorizedCaller;
  /** Awaited `context.params`; `{}` when the route has no dynamic segment. */
  params: P;
}

export interface RouteConfig {
  /** Rejects a body that is not `application/json`, before the handler runs. */
  json?: boolean;
}

/**
 * Wraps a session-gated `/api/**` handler in the preamble every one of them needs.
 *
 * Four things were repeated verbatim in each handler: reject the caller without a
 * session, reject the wrong content type, resolve `context.params`, and turn an
 * unexpected throw into an opaque 500. Written out per handler they are also four
 * things a new route can silently omit — and omitting the first proxies an
 * anonymous request to the backend. Here they are structural: a handler cannot run
 * without a `caller`, because that is the only way it is given one.
 *
 * The handler returns the success response; `callBackend` already converts a failed
 * backend call into a safe one, so `result.response` is passed straight through.
 *
 * Deliberately not used by `app/api/account/**`. Those routes are reached by people
 * who cannot sign in yet, so they take no session and gate themselves instead.
 *
 * Declared as two overloads because Next type-checks what a route file exports: a
 * static route's handler is called with the request alone, and one optional
 * parameter covering both shapes is rejected as an invalid export.
 */
export function defineRoute(
  config: RouteConfig,
  handler: (args: RouteArgs<Record<string, never>>) => Promise<Response>,
): (request: Request) => Promise<Response>;
export function defineRoute<P extends RouteParams>(
  config: RouteConfig,
  handler: (args: RouteArgs<P>) => Promise<Response>,
): (request: Request, context: { params: Promise<P> }) => Promise<Response>;
export function defineRoute<P extends RouteParams>(
  config: RouteConfig,
  handler: (args: RouteArgs<P>) => Promise<Response>,
) {
  return async (
    request: Request,
    context?: { params: Promise<P> },
  ): Promise<Response> => {
    const session = await requireSession(request);
    if (!session.ok) return session.response;

    if (config.json) {
      const wrongContentType = requireJsonContentType(request);
      if (wrongContentType) return wrongContentType;
    }

    try {
      const params = context ? await context.params : ({} as P);

      return await handler({ request, caller: session.caller, params });
    } catch (reason) {
      return routeError(routeLabel(request), reason);
    }
  };
}

/**
 * `POST /api/transactions` — the method and path of the request that failed.
 *
 * Derived rather than passed in. Every handler used to carry its own hand-written
 * label, and a copied one names the wrong route for as long as nobody notices. The
 * query string is left off so no request value reaches the log.
 */
function routeLabel(request: Request): string {
  try {
    return `${request.method} ${new URL(request.url).pathname}`;
  } catch {
    return `${request.method} <unparseable url>`;
  }
}

/**
 * Guards a path segment that must be a UUID; returns the 400 to send back, or null.
 *
 * Builds a fresh `Response` per call on purpose: a body can only be consumed once,
 * so a shared instance would be empty the second time a route rejected an id.
 */
export function requireUuid(
  value: string | undefined,
  label: string,
): Response | null {
  if (isUuid(value)) {
    return null;
  }

  return Response.json(
    { error: `A valid ${label} id is required.` },
    { status: 400 },
  );
}
