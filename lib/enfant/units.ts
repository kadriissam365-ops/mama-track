export type UnitSystem = "metric" | "imperial";

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function formatWeight(grams: number | null | undefined, units: UnitSystem): string {
  if (grams == null) return "—";
  if (units === "imperial") {
    const lb = grams / 1000 / KG_PER_LB;
    return `${lb.toFixed(2)} lb`;
  }
  return `${(grams / 1000).toFixed(2)} kg`;
}

export function weightNumber(grams: number | null | undefined, units: UnitSystem): number | null {
  if (grams == null) return null;
  return units === "imperial" ? grams / 1000 / KG_PER_LB : grams / 1000;
}

export function formatLength(cm: number | null | undefined, units: UnitSystem): string {
  if (cm == null) return "—";
  if (units === "imperial") {
    const inches = cm / CM_PER_IN;
    return `${inches.toFixed(1)} in`;
  }
  return `${Number(cm).toFixed(1)} cm`;
}

export function lengthNumber(cm: number | null | undefined, units: UnitSystem): number | null {
  if (cm == null) return null;
  return units === "imperial" ? cm / CM_PER_IN : cm;
}

export function weightUnitLabel(units: UnitSystem): string {
  return units === "imperial" ? "lb" : "kg";
}

export function lengthUnitLabel(units: UnitSystem): string {
  return units === "imperial" ? "in" : "cm";
}

export function formatTemperature(
  celsius: number | null | undefined,
  units: UnitSystem,
): string {
  if (celsius == null) return "—";
  if (units === "imperial") {
    const f = (Number(celsius) * 9) / 5 + 32;
    return `${f.toFixed(1)}°F`;
  }
  return `${Number(celsius).toFixed(1)}°C`;
}

export function temperatureUnitLabel(units: UnitSystem): string {
  return units === "imperial" ? "°F" : "°C";
}

/** Convert a raw temperature value entered by the user (in their unit) to Celsius for storage. */
export function temperatureToCelsius(value: number, units: UnitSystem): number {
  if (units === "imperial") return ((value - 32) * 5) / 9;
  return value;
}
