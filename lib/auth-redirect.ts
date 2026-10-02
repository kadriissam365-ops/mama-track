/** Only same-origin application paths may survive an authentication redirect. */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\x00-\x20]/.test(decoded)) return fallback;
    const url = new URL(value, "https://mamatrack.fr");
    return url.origin === "https://mamatrack.fr" ? url.pathname + url.search + url.hash : fallback;
  } catch { return fallback; }
}
