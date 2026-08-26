/**
 * Same-origin paths only, so a `?callbackUrl=` value cannot turn sign-in into an open
 * redirect.
 *
 * Checking for a leading `//` is not enough: browsers also treat a backslash as a path
 * separator, so `/\evil.com` resolves to `https://evil.com`. Resolving against a throwaway
 * origin and confirming it stayed there settles it for every encoding rather than for the
 * two spellings someone remembered.
 */
export function isSafeCallbackUrl(value: string): boolean {
  if (!value.startsWith("/")) return false;

  try {
    return (
      new URL(value, "https://finance-tracker.invalid").origin ===
      "https://finance-tracker.invalid"
    );
  } catch {
    return false;
  }
}
