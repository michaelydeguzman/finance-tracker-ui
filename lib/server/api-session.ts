import "server-only";

/**
 * Talking to the .NET API's auth endpoints.
 *
 * These run on the Next.js server only. The BFF shared secret and the user's refresh token
 * must never reach the browser, so nothing here may be imported from a client component —
 * `server-only` turns that mistake into a build error rather than a leak.
 */

/** Credentials the BFF holds for a signed-in user. Kept in the session cookie, never sent to the browser. */
export interface ApiSession {
  userId: string;
  email: string;
  emailVerified: boolean;
  accessToken: string;
  /** Epoch milliseconds. Compared against `Date.now()` to decide when to refresh. */
  accessTokenExpiresAt: number;
  refreshToken: string;
}

interface AuthResultDto {
  userId: string;
  email: string;
  emailVerified: boolean;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

/** Base URL of the .NET API, without a trailing slash. */
function apiBaseUrl(): string {
  const url = process.env.API_URL;

  if (!url) {
    throw new Error("API_URL is not configured.");
  }

  return url.replace(/\/+$/, "");
}

function toApiSession(dto: AuthResultDto): ApiSession {
  return {
    userId: dto.userId,
    email: dto.email,
    emailVerified: dto.emailVerified,
    accessToken: dto.accessToken,
    accessTokenExpiresAt: new Date(dto.accessTokenExpiresAt).getTime(),
    refreshToken: dto.refreshToken,
  };
}

/**
 * Posts to an auth endpoint and unwraps the API's `{ success, message, data }` envelope.
 *
 * Returns the payload, or null for any failure. Callers deliberately cannot tell *why* a
 * call failed: the API answers identically for an unknown address and a wrong password, and
 * relaying a distinction it does not make would invent one.
 */
async function postAuth<T>(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      // Logged server-side only — the body can carry detail the browser must not see.
      console.error(`[auth] POST ${path} -> ${response.status}`);
      return null;
    }

    const envelope = (await response.json()) as {
      success?: boolean;
      data?: T;
    };

    return envelope?.success === false ? null : (envelope?.data ?? null);
  } catch (reason) {
    console.error(`[auth] POST ${path} failed:`, reason);
    return null;
  }
}

/**
 * Turns a completed SSO sign-in into an API session.
 *
 * Guarded by a shared secret because it mints a session from a provider subject rather than
 * a credential — any caller able to reach it could impersonate anyone, so it must never be
 * reachable from a browser.
 */
export async function exchangeExternalLogin(input: {
  provider: "Google" | "GitHub";
  providerSubject: string;
  email: string;
  emailVerified: boolean;
  displayName?: string | undefined;
}): Promise<ApiSession | null> {
  const secret = process.env.API_BFF_SECRET;

  if (!secret) {
    console.error(
      "[auth] API_BFF_SECRET is not configured; cannot exchange an SSO sign-in.",
    );
    return null;
  }

  const dto = await postAuth<AuthResultDto>("/v1/auth/exchange", input, {
    "X-Bff-Secret": secret,
  });

  return dto ? toApiSession(dto) : null;
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<ApiSession | null> {
  const dto = await postAuth<AuthResultDto>("/v1/auth/login", {
    email,
    password,
  });
  return dto ? toApiSession(dto) : null;
}

export async function consumeMagicLink(
  token: string,
): Promise<ApiSession | null> {
  const dto = await postAuth<AuthResultDto>("/v1/auth/magic-link/consume", {
    token,
  });
  return dto ? toApiSession(dto) : null;
}

export async function refreshApiSession(
  refreshToken: string,
): Promise<ApiSession | null> {
  const dto = await postAuth<AuthResultDto>("/v1/auth/refresh", {
    token: refreshToken,
  });
  return dto ? toApiSession(dto) : null;
}

/**
 * Endpoints that deliberately answer the same way whether or not the address is known, so
 * that neither the BFF nor the browser can use them to discover who has an account.
 */
export async function requestRegistration(input: {
  email: string;
  password: string;
  displayName?: string | undefined;
}): Promise<boolean> {
  return (await postAuth<unknown>("/v1/auth/register", input)) !== null;
}

export async function requestMagicLink(email: string): Promise<void> {
  await postAuth<unknown>("/v1/auth/magic-link/request", { email });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await postAuth<unknown>("/v1/auth/password-reset/request", { email });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<boolean> {
  return (
    (await postAuth<unknown>("/v1/auth/password-reset/confirm", {
      token,
      newPassword,
    })) !== null
  );
}

export async function verifyEmail(token: string): Promise<boolean> {
  return (await postAuth<unknown>("/v1/auth/verify-email", { token })) !== null;
}
