import { describe, it, expect } from "vitest";
import {
  childPhase,
  childAgeMonths,
  childAgeLabel,
  pregnancyMoment,
  resolveFamilyPhase,
  parseCalendarDate,
  addCalendarMonths,
  calendarDate,
} from "@/lib/family-journey";
import {
  computeUpcomingVaccines,
  vaccineRecorded,
  vaccineCode,
} from "@/lib/enfant/vaccines-due";
import { scheduledVisitDate, HAS_VISITS } from "@/lib/enfant/checklist-data";
describe("Family chapters follow real calendar dates", () => {
  it("opens the child chapter on the third Paris birthday, including after UTC midnight differences", () => {
    expect(childPhase("2023-10-06", new Date("2026-10-05T21:59:59Z"))).toBe(
      "baby",
    );
    expect(childPhase("2023-10-06", new Date("2026-10-05T22:00:00Z"))).toBe(
      "child",
    );
    expect(childAgeMonths("2023-10-06", new Date("2026-10-06T12:00Z"))).toBe(
      36,
    );
    expect(childAgeLabel("2022-10-07", new Date("2026-10-06T12:00Z"))).toBe(
      "3 ans et 11 mois",
    );
  });
  it("retains the selected pregnancy even at term; birth is a separate confirmed action", () => {
    expect(pregnancyMoment("2026-10-06", new Date("2026-10-06T12:00Z"))).toBe(
      "term",
    );
    expect(
      resolveFamilyPhase(
        "pregnancy",
        "2022-01-01",
        new Date("2026-10-06T12:00Z"),
      ),
    ).toBe("pregnancy");
    expect(
      resolveFamilyPhase("baby", "2022-01-01", new Date("2026-10-06T12:00Z")),
    ).toBe("child");
    expect(pregnancyMoment("2026-10-27", new Date("2026-10-06T12:00Z"))).toBe(
      "approaching",
    );
    expect(pregnancyMoment("2026-10-28", new Date("2026-10-06T12:00Z"))).toBe(
      "expecting",
    );
  });
  it("clamps leap dates and month ends without DST drift or accepting impossible dates", () => {
    expect(parseCalendarDate("2026-02-30")).toBeNull();
    expect(
      addCalendarMonths(parseCalendarDate("2024-02-29")!, 36)
        .toISOString()
        .slice(0, 10),
    ).toBe("2027-02-28");
    expect(
      addCalendarMonths(parseCalendarDate("2026-01-31")!, 1)
        .toISOString()
        .slice(0, 10),
    ).toBe("2026-02-28");
    expect(childAgeMonths("2024-02-29", new Date("2027-02-28T12:00Z"))).toBe(
      36,
    );
    expect(calendarDate(new Date("2026-10-06T23:00Z"))).toBe("2026-10-07");
  });
  it("keeps six-year records accessible and does not derive an unborn child's age", () => {
    expect(childPhase("2020-10-06", new Date("2026-10-06T12:00Z"))).toBe(
      "child",
    );
    expect(childAgeLabel("2026-12-01", new Date("2026-10-06T12:00Z"))).toBe(
      "À naître",
    );
    expect(childAgeLabel("invalid")).toBe("Âge à renseigner");
  });
});
describe("2026 health schedule and preserved historical doses", () => {
  it("reminds the six-year booster on the birthday even late that day", () => {
    const rows = computeUpcomingVaccines({
      birthDate: new Date("2020-10-06"),
      givenCodes: new Set(),
      windowDays: 0,
      now: new Date("2026-10-06T21:59:00Z"),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].ageMonths).toBe(72);
    expect(rows[0].daysUntil).toBe(0);
  });
  it("recognizes old B dose labels without pretending another dose was given", () => {
    const old = new Set([vaccineCode(5, "Méningocoque B (1ère dose)")]);
    expect(
      vaccineRecorded(old, vaccineCode(3, "Méningocoque B (1ère dose)")),
    ).toBe(true);
    expect(
      vaccineRecorded(old, vaccineCode(5, "Méningocoque B (2e dose)")),
    ).toBe(false);
  });
  it("uses current meningococcal dates and stable month-end dates", () => {
    const rows = computeUpcomingVaccines({
      birthDate: new Date("2026-01-31"),
      givenCodes: new Set(),
      windowDays: 0,
      now: new Date("2026-04-30T12:00Z"),
    });
    expect(rows.some((r) => r.label === "Méningocoque B (1ère dose)")).toBe(
      true,
    );
    const acwy = computeUpcomingVaccines({
      birthDate: new Date("2026-01-31"),
      givenCodes: new Set(),
      windowDays: 0,
      now: new Date("2026-07-31T12:00Z"),
    });
    expect(acwy[0].label).toBe("Méningocoque ACWY (1ère dose)");
  });
  it("distinguishes the second-week exam from the first neonatal exam", () => {
    expect(
      scheduledVisitDate(
        "2026-09-30",
        HAS_VISITS.find((v) => v.code === "j14")!,
      )
        .toISOString()
        .slice(0, 10),
    ).toBe("2026-10-07");
    expect(
      HAS_VISITS.filter((v) => v.ageMonths >= 36).map((v) => v.ageMonths),
    ).toEqual([36, 48, 60, 72]);
  });
});
