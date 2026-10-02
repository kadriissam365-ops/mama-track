export function todayInParis(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function validBirthDate(value: unknown, today = todayInParis()): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= "1970-01-01" && value <= today;
}

export function parseBirth(form: FormData, today = todayInParis()) {
  const name = String(form.get("name") ?? "").trim();
  const birthDate = form.get("birth_date");
  const sex = form.get("sex");
  if (!name || name.length > 80) return { error: "name" } as const;
  if (!validBirthDate(birthDate, today)) return { error: "date" } as const;
  if (sex && !["M", "F", "X"].includes(String(sex))) return { error: "sex" } as const;
  const numbers: Record<string, number | null> = {};
  for (const [key, min, max] of [["birth_weight_g", 300, 8000], ["birth_height_cm", 25, 80], ["birth_head_cm", 20, 50]] as const) {
    const raw = form.get(key);
    const value = raw === null || raw === "" ? null : Number(raw);
    if (value !== null && (!Number.isFinite(value) || value < min || value > max || (key === "birth_weight_g" && !Number.isInteger(value)))) return { error: "measurements" } as const;
    numbers[key] = value;
  }
  return { value: { name, birth_date: birthDate, sex: sex || null, birth_weight_g: numbers.birth_weight_g, birth_height_cm: numbers.birth_height_cm, birth_head_cm: numbers.birth_head_cm } } as const;
}
