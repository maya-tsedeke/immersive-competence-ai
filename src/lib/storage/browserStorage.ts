/**
 * Browser persistence (GitHub Pages / static export).
 *
 * Runtime data lives in localStorage / sessionStorage — never in src/lib/generated/*.json
 * on the deployed site (those files are build-time bundles only).
 *
 * For server-backed persistence later, use an API + optional sqliteAdapter.server.ts.
 */

export const STORAGE_NOTE_STATIC =
  "GitHub Pages uses browser storage and exported JSON. SQLite persistence requires server deployment.";

export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
