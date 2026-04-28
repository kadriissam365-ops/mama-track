import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { analyzeImage, isVisionConfigured } from "@/lib/ai-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

interface RequestBody {
  image?: string;
  mimeType?: string;
}

const PROMPT = `Tu es un assistant médical français spécialisé en échographie obstétricale. Analyse cette photo d'échographie et extrais les mesures et informations visibles.

Identifie ces champs s'ils apparaissent :
- examDate : date de l'examen au format YYYY-MM-DD si visible (sinon null)
- gestationalAgeWeeks : âge gestationnel en semaines (number, ex: 22) — souvent noté "GA", "AG" ou "SA"
- gestationalAgeDays : jours en plus (number 0-6, ex: 3 pour "22+3")
- ageUnit : "SA" si l'unité affichée est aménorrhée, "GA" si gestationnel, sinon null
- bpd : diamètre bipariétal en mm (number)
- hc : périmètre crânien en mm (number)
- ac : périmètre abdominal en mm (number)
- fl : longueur fémorale en mm (number)
- estimatedWeight : poids estimé en grammes (number)
- heartRate : rythme cardiaque foetal en bpm (number)
- presentation : "céphalique", "siège", "transverse" ou null
- sex : "M", "F" ou null si visible/non visible

Si la photo n'est pas une échographie lisible, mets tous les champs à null et explique dans warning.
Ne devine PAS de valeurs : si une mesure n'est pas clairement lisible, retourne null pour ce champ.

Réponds UNIQUEMENT en JSON valide, sans texte autour.`;

const SCHEMA = {
  type: "object",
  properties: {
    examDate: { type: "string", nullable: true },
    gestationalAgeWeeks: { type: "number", nullable: true },
    gestationalAgeDays: { type: "number", nullable: true },
    ageUnit: { type: "string", nullable: true, enum: ["SA", "GA"] },
    bpd: { type: "number", nullable: true },
    hc: { type: "number", nullable: true },
    ac: { type: "number", nullable: true },
    fl: { type: "number", nullable: true },
    estimatedWeight: { type: "number", nullable: true },
    heartRate: { type: "number", nullable: true },
    presentation: { type: "string", nullable: true },
    sex: { type: "string", nullable: true },
    warning: { type: "string", nullable: true },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: ["confidence"],
};

export async function POST(req: Request) {
  if (!isVisionConfigured()) {
    return NextResponse.json({ error: "Service vision non configuré (GEMINI_API_KEY manquante)" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRaw as { is_premium?: boolean; premium_until?: string | null } | null;
  const premium = Boolean(profile?.is_premium) && (!profile?.premium_until || new Date(profile.premium_until) > new Date());
  if (!premium) {
    return NextResponse.json({ error: "Fonctionnalité Premium" }, { status: 402 });
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const image = body.image?.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "") ?? "";
  const mimeType = body.mimeType ?? "image/jpeg";
  if (!image) {
    return NextResponse.json({ error: "Image manquante" }, { status: 400 });
  }
  if (!/^image\/(jpeg|jpg|png|webp|heic|heif)$/.test(mimeType)) {
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 415 });
  }
  if (image.length * 0.75 > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image trop volumineuse (max 8 Mo)" }, { status: 413 });
  }

  try {
    const raw = await analyzeImage({ imageBase64: image, mimeType, prompt: PROMPT, responseSchema: SCHEMA });
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur inconnue";
    return NextResponse.json({ error: `Analyse impossible : ${msg}` }, { status: 500 });
  }
}
