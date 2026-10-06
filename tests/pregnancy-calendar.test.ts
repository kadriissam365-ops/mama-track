import { afterEach, it, expect, vi } from "vitest";
import {
  getCurrentWeek,
  getCurrentWeekAndDays,
  getDaysRemaining,
} from "@/lib/pregnancy-data";
afterEach(() => vi.useRealTimers());
it("keeps the due-date week and countdown consistent throughout a Paris calendar day", () => {
  vi.useFakeTimers();
  const due = new Date("2026-10-06T12:00:00Z");
  vi.setSystemTime(new Date("2026-10-05T21:59:00Z"));
  expect(getCurrentWeekAndDays(due)).toEqual({ weeks: 39, days: 6 });
  expect(getDaysRemaining(due)).toBe(1);
  for (const time of [
    "2026-10-05T22:00:00Z",
    "2026-10-06T00:30:00Z",
    "2026-10-06T21:59:00Z",
  ]) {
    vi.setSystemTime(new Date(time));
    expect(getCurrentWeekAndDays(due)).toEqual({ weeks: 40, days: 0 });
    expect(getCurrentWeek(due)).toBe(40);
    expect(getDaysRemaining(due)).toBe(0);
  }
});
