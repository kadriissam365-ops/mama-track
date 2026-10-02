import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth-redirect";
import { parseBirth, validBirthDate, todayInParis } from "@/lib/enfant/birth-validation";
import { readJsonBody } from "@/lib/request-json";
import { validPushEndpoint } from "@/lib/push-validation";
describe("family form and request boundaries", () => {
  it("cannot turn a push subscription into a request to an internal server", () => {
    for (const url of ["http://127.0.0.1", "https://localhost", "https://fcm.googleapis.com.evil.test", "https://fcm.googleapis.com:444", "https://me:secret@fcm.googleapis.com", "https://169.254.169.254"]) expect(validPushEndpoint(url)).toBe(false);
    expect(validPushEndpoint("https://fcm.googleapis.com/wp/token")).toBe(true);
    expect(validPushEndpoint("https://web.push.apple.com/token")).toBe(true);
  });
  it("rejects external authentication redirects", () => {
    for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "/%2fevil.test", "/%5cevil.test", "/%0aevil.test"]) expect(safeNextPath(path)).toBe("/");
    expect(safeNextPath("/enfant/duo/join?token=abc")).toBe("/enfant/duo/join?token=abc");
  });
  it("uses Paris dates and rejects calendar rollover and future births", () => {
    expect(todayInParis(new Date("2026-09-30T23:30:00Z"))).toBe("2026-10-01");
    expect(validBirthDate("2026-02-30","2026-10-02")).toBe(false);
    expect(validBirthDate("2026-10-03","2026-10-02")).toBe(false);
    const form = new FormData(); form.set("name"," Lou "); form.set("birth_date","2026-09-01"); form.set("birth_weight_g","NaN");
    expect(parseBirth(form,"2026-10-02").error).toBe("measurements");
    form.set("birth_weight_g","3200"); expect(parseBirth(form,"2026-10-02").value?.name).toBe("Lou");
  });
  it("bounds streamed JSON without relying on Content-Length", async () => {
    await expect(readJsonBody(new Request("https://mamatrack.fr",{ method:"POST",body:'{"hello":"world"}' }),8)).rejects.toThrow("body_too_large");
    expect(await readJsonBody(new Request("https://mamatrack.fr",{ method:"POST",body:'{"ok":true}' }))).toEqual({ok:true});
  });
});
