// @vitest-environment node
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import { SW_SOURCE } from "@/lib/sw-source";
it("never serves or stores a previous family's authenticated page while offline", async () => {
  const handlers: Record<string, (event: unknown) => void> = {};
  const cached: string[] = [];
  const puts: string[] = [];
  runInNewContext(SW_SOURCE, {
    URL,
    self: { location: { origin: "https://mamatrack.fr" }, addEventListener: (name: string, handler: (event: unknown) => void) => { handlers[name] = handler; }, skipWaiting() {}, clients: {claim() {}} },
    caches: { match: async (key: string) => { cached.push(key); return "public-offline-page"; }, open: async () => ({ put: (key: string) => puts.push(key) }) },
    fetch: async () => { throw new Error("offline"); },
  });
  let response: Promise<unknown> | undefined;
  handlers.fetch({ request: { method:"GET", mode:"navigate", url:"https://mamatrack.fr/enfant/diary" }, respondWith(value: Promise<unknown>) { response=value; } });
  expect(await response).toBe("public-offline-page");
  expect(cached).toEqual(["/offline.html"]);
  handlers.fetch({ request: { method:"GET", mode:"cors", url:"https://mamatrack.fr/enfant/diary?_rsc=private" }, respondWith() { throw new Error("private RSC intercepted"); } });
  expect(puts).toEqual([]);
});
