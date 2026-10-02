/** Push endpoints are called by the server: restrict them to browser providers. */
export function validPushEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;
    const host = url.hostname;
    return host === "fcm.googleapis.com" || host === "updates.push.services.mozilla.com" || host.endsWith(".push.apple.com") || host.endsWith(".notify.windows.com");
  } catch { return false; }
}
export function validPushKey(value: unknown, max = 256): value is string {
  return typeof value === "string" && value.length >= 16 && value.length <= max && /^[A-Za-z0-9_-]+={0,2}$/.test(value);
}
