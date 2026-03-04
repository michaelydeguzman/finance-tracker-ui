/**
 * API configuration and base URL resolver.
 *
 * - Server-side (actions / route handlers): uses `API_URL` env var.
 * - Client-side (browser fetches): uses relative paths via endpoint constants.
 */

/** Base URL for server-side external API calls. */
export const API_BASE_URL = process.env.API_URL ?? "";

/**
 * Joins a base URL with a path, preventing double slashes.
 *
 * @param base - The base URL (e.g. "https://api.example.com").
 * @param path - The path segment (e.g. "/api/v1/categories").
 * @returns The joined URL string.
 */
export function buildUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "/");
  return `${trimmedBase}${trimmedPath}`;
}

/**
 * Resolves an endpoint path against the server-side base URL.
 *
 * @param path - The endpoint path (e.g. "/api/v1/categories").
 * @returns Fully qualified URL for server-side calls.
 */
export function serverUrl(path: string): string {
  return buildUrl(API_BASE_URL, path);
}
