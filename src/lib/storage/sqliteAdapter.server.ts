/**
 * Optional server-side SQLite persistence (future).
 * Do not import from client components — GitHub Pages has no Node SQLite runtime.
 */
export async function persistLearnerEvent(): Promise<never> {
  throw new Error(
    "SQLite adapter is not enabled. Use browser localStorage + Export Demo JSON on GitHub Pages, or deploy with a server and wire this adapter.",
  );
}
