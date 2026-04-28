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

const PROMPT = `Tu es un assistant médical français. Analyse cette photo d'ordonnance médicale et extrais TOUS les médicaments prescrits.

Pour chaque médicament, identifie :
- name : nom commercial ou DCI (string, obligatoire)
- dosage : dosage par prise (ex: "500 mg", "1 comprimé", "10 gouttes")
- frequency : fréquence quotidienne (ex: "2 fois par jour", "matin et soir", "toutes les 8h")
- duration : durée du traitement (ex: "5 jours", "1 mois", "jusqu'à amélioration") ou null si non précisée
- instructions : consignes particulières (ex: "à jeun", "pendant les repas") ou null

Si la photo n'est pas une ordonnance lisible, retourne medications: [] et explique dans warning.

Ajoute un warning si tu détectes un médicament potentiellement contre-indiqué pendant la grossesse (AINS comme ibuprofène/aspirine, isotrétinoïne, certains antibiotiques tétracyclines, etc.) — sans diagnostic, juste un signalement à vérifier avec le médecin.

Réponds UNIQUEMENT en JSON valide, sans texte autour.`;

const SCHEMA = {
  type: "object",
  properties: {
    medications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          dosage: { type: "string" },
          frequency: { type: "string" },
          duration: { type: "string", nullable: true },
          instructions: { type: "string", nullable: true },
        },
        required: ["name", "dosage", "frequency"],
      },
    },
    warning: { type: "string", nullable: true },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: ["medications", "confidence"],
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
