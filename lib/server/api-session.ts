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
 * Reports whether the call succeeded and, separately, its payload — several succeed with no
 * data at all. Callers deliberately cannot tell *why* a call failed: the API answers
 * identically for an unknown address and a wrong password, and relaying a distinction it does
 * not make would invent one.
 */
async function sendAuth<T>(
  path: string,
  body: unknown,
): Promise<{ ok: boolean; data: T | null }> {
  // Every auth endpoint on the API requires the shared secret, not just the SSO exchange.
  // The API's address is public and who may sign up is decided here, so answering direct
  // callers would let anyone register or sign in past AUTH_SIGNUP_MODE.
  const secret = process.env.API_BFF_SECRET;

  if (!secret) {
    // The API would refuse the call anyway; failing here keeps a misconfigured deployment
    // from looking like an API outage.
    console.error(
      `[auth] API_BFF_SECRET is not configured; cannot call ${path}.`,
    );
    return FAILED;
  }

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Bff-Secret": secret },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      // Logged server-side only — the body can carry detail the browser must not see.
      console.error(`[auth] POST ${path} -> ${response.status}`);
      return FAILED;
    }

    const envelope = (await response.json()) as {
      success?: boolean;
      data?: T;
    };

    return envelope?.success === false
      ? FAILED
      : { ok: true, data: envelope?.data ?? null };
  } catch (reason) {
    console.error(`[auth] POST ${path} failed:`, reason);
    return FAILED;
  }
}

const FAILED = { ok: false, data: null } as const;

/** The payload of a call that returns one, or null for any failure. */
async function postAuth<T>(path: string, body: unknown): Promise<T | null> {
  return (await sendAuth<T>(path, body)).data;
}

/**
 * Whether a call succeeded, for the ones that answer with no data at all — reset,
 * confirmation, registration. Reading their null payload as failure told people a password
 * change had not happened after it had.
 */
async function postAuthSucceeded(
  path: string,
  body: unknown,
): Promise<boolean> {
  return (await sendAuth<unknown>(path, body)).ok;
}

/**
 * Turns a completed SSO sign-in into an API session.
 *
 * The sharpest reason the shared secret exists: this mints a session from a provider subject
 * rather than a credential — any caller able to reach it could impersonate anyone, so it must
 * never be reachable from a browser. `postAuth` attaches the secret.
 */
export async function exchangeExternalLogin(input: {
  provider: "Google" | "GitHub";
  providerSubject: string;
  email: string;
  emailVerified: boolean;
  displayName?: string | undefined;
}): Promise<ApiSession | null> {
  const dto = await postAuth<AuthResultDto>("/v1/auth/exchange", input);

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

/**
 * Refreshes in flight, keyed by the token being spent.
 *
 * Refresh tokens are single use and rotate, so two requests arriving together near expiry
 * would each spend the same token and one would always lose. Sharing the promise means
 * they spend it once and both get the same new session.
 *
 * This is per server instance, not distributed: across several instances the race can
 * still happen, which is why the caller also tolerates a lost race rather than treating it
 * as a dead session. It removes the common case — concurrent requests from one browser
 * hitting one instance — not the theoretical one.
 */
const refreshesInFlight = new Map<string, Promise<ApiSession | null>>();

export async function refreshApiSession(
  refreshToken: string,
): Promise<ApiSession | null> {
  const alreadyRunning = refreshesInFlight.get(refreshToken);

  if (alreadyRunning) {
    return alreadyRunning;
  }

  const running = (async () => {
    const dto = await postAuth<AuthResultDto>("/v1/auth/refresh", {
      token: refreshToken,
    });
    return dto ? toApiSession(dto) : null;
  })();

  refreshesInFlight.set(refreshToken, running);

  try {
    return await running;
  } finally {
    refreshesInFlight.delete(refreshToken);
  }
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
  return postAuthSucceeded("/v1/auth/register", input);
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
  return postAuthSucceeded("/v1/auth/password-reset/confirm", {
    token,
    newPassword,
  });
}

/**
 * Confirms an address. Takes the password chosen at sign-up as well as the emailed token: the
 * token proves control of the inbox, not that the clicker chose this account's password, and
 * the API refuses to vouch for a password on a click alone.
 */
export async function verifyEmail(
  token: string,
  password: string,
): Promise<boolean> {
  return postAuthSucceeded("/v1/auth/verify-email", { token, password });
}
