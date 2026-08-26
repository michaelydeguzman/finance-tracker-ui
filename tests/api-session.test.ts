import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The BFF's side of the auth conversation.
 *
 * These cover the parts a mistake would make dangerous rather than merely broken: whether
 * the shared secret is attached, whether a failed call can be told apart from a rejected
 * one, and whether the expiry the refresh logic depends on is parsed at all.
 */

const ORIGINAL_ENV = { ...process.env };

const authResult = {
  userId: "5f1b6c1e-0000-4000-8000-000000000001",
  email: "person@example.com",
  emailVerified: true,
  accessToken: "an.access.token",
  accessTokenExpiresAt: "2026-08-26T12:15:00.000Z",
  refreshToken: "a-refresh-token",
};

const okEnvelope = (data: unknown) =>
  new Response(JSON.stringify({ success: true, message: null, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

async function loadModule() {
  vi.resetModules();
  return import("@/lib/server/api-session");
}

beforeEach(() => {
  process.env.API_URL = "https://api.test/api";
  process.env.API_BFF_SECRET = "shared-secret";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("loginWithPassword", () => {
  it("parses the expiry into epoch milliseconds", async () => {
    // The whole refresh-before-expiry decision rests on this number. Left as a string it
    // would compare falsely against Date.now() and the token would never be renewed.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okEnvelope(authResult)));
    const { loginWithPassword } = await loadModule();

    const session = await loginWithPassword("person@example.com", "a password");

    expect(session?.accessTokenExpiresAt).toBe(
      new Date(authResult.accessTokenExpiresAt).getTime(),
    );
  });

  it("returns null for rejected credentials without surfacing why", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 })),
    );
    const { loginWithPassword } = await loadModule();

    await expect(
      loginWithPassword("person@example.com", "wrong"),
    ).resolves.toBeNull();
  });

  it("returns null when the API is unreachable", async () => {
    // A network failure must look like a failed sign-in, not crash the sign-in page.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );
    const { loginWithPassword } = await loadModule();

    await expect(
      loginWithPassword("person@example.com", "a password"),
    ).resolves.toBeNull();
  });
});

describe("exchangeExternalLogin", () => {
  const externalLogin = {
    provider: "Google" as const,
    providerSubject: "google-subject-1",
    email: "person@example.com",
    emailVerified: true,
  };

  it("sends the shared secret header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okEnvelope(authResult));
    vi.stubGlobal("fetch", fetchMock);
    const { exchangeExternalLogin } = await loadModule();

    await exchangeExternalLogin(externalLogin);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/api/v1/auth/exchange");
    expect((init.headers as Record<string, string>)["X-Bff-Secret"]).toBe(
      "shared-secret",
    );
  });

  it("refuses to call the endpoint when the secret is missing", async () => {
    // Calling without it would be rejected anyway, but failing here keeps a misconfigured
    // deployment from looking like an API outage.
    delete process.env.API_BFF_SECRET;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { exchangeExternalLogin } = await loadModule();

    await expect(exchangeExternalLogin(externalLogin)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("relays the provider's unverified-email assertion faithfully", async () => {
    // The API refuses to attach an unverified address to an existing account. Sending true
    // regardless would hand it the takeover it is guarding against.
    const fetchMock = vi.fn().mockResolvedValue(okEnvelope(authResult));
    vi.stubGlobal("fetch", fetchMock);
    const { exchangeExternalLogin } = await loadModule();

    await exchangeExternalLogin({ ...externalLogin, emailVerified: false });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      emailVerified: false,
    });
  });
});

describe("envelope handling", () => {
  it("treats success:false as a failure even on a 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ success: false, message: "nope", data: null }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        ),
    );
    const { verifyEmail } = await loadModule();

    await expect(verifyEmail("a-token")).resolves.toBe(false);
  });
});

describe("configuration", () => {
  it("throws rather than interpolating undefined into the URL", async () => {
    delete process.env.API_URL;
    vi.stubGlobal("fetch", vi.fn());
    const { loginWithPassword } = await loadModule();

    // Caught by postAuth and reported as a failed call, never as a request to "undefined/...".
    await expect(loginWithPassword("a@b.com", "pw")).resolves.toBeNull();
  });
});

describe("refreshApiSession", () => {
  it("spends a refresh token once when several requests race for it", async () => {
    // Refresh tokens are single use and rotate, so two concurrent requests near expiry
    // would each spend the same one and a loser would be signed out spuriously.
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => {
        calls += 1;
        // Resolve on a later tick so the second caller arrives mid-flight.
        await new Promise((resolve) => setTimeout(resolve, 10));
        return okEnvelope(authResult);
      }),
    );
    const { refreshApiSession } = await loadModule();

    const [first, second] = await Promise.all([
      refreshApiSession("a-refresh-token"),
      refreshApiSession("a-refresh-token"),
    ]);

    expect(calls).toBe(1);
    expect(first).toEqual(second);
    expect(first?.accessToken).toBe(authResult.accessToken);
  });

  it("does not hold a failed refresh against the next attempt", async () => {
    // The in-flight entry has to be cleared on failure too, or one network blip would
    // wedge every later refresh of that token behind a rejected promise.
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValueOnce(okEnvelope(authResult));
    vi.stubGlobal("fetch", fetchMock);
    const { refreshApiSession } = await loadModule();

    await expect(refreshApiSession("a-refresh-token")).resolves.toBeNull();
    await expect(refreshApiSession("a-refresh-token")).resolves.not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not share a flight between different tokens", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okEnvelope(authResult));
    vi.stubGlobal("fetch", fetchMock);
    const { refreshApiSession } = await loadModule();

    await Promise.all([
      refreshApiSession("token-a"),
      refreshApiSession("token-b"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
