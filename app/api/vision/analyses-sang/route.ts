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

const PROMPT = `Tu es une sage-femme française qui aide une femme enceinte à comprendre ses analyses de sang. Analyse cette photo de compte-rendu d'analyses sanguines (laboratoire de biologie médicale) et extrais TOUS les résultats lisibles.

Pour chaque ligne d'analyse, identifie :
- name : nom du paramètre (ex: "Hémoglobine", "Plaquettes", "Ferritine", "TSH", "Glycémie à jeun", "Sérologie toxoplasmose IgG", "Groupe sanguin", "Créatinine"…)
- value : valeur mesurée telle qu'écrite (string — garde les unités décimales françaises avec virgule si présentes, ex: "11,8")
- unit : unité (ex: "g/dL", "10^9/L", "µg/L", "mUI/L", "g/L", "mmol/L", "UI/mL"). Si non mentionnée, mets "".
- refMin : borne inférieure de référence (string ou null)
- refMax : borne supérieure de référence (string ou null)
- status : "low" si la valeur est sous la borne, "high" si au-dessus, "normal" si dans l'intervalle, "unknown" si tu ne peux pas comparer (sérologie qualitative, groupe sanguin, valeur illisible…)

Marqueurs typiques de suivi de grossesse à reconnaître prioritairement :
- NFS : hémoglobine, hématocrite, VGM, plaquettes, leucocytes, polynucléaires
- Ferritine, fer sérique, coefficient de saturation
- Glycémie à jeun, HGPO (test O'Sullivan, hyperglycémie provoquée 75 g)
- TSH, T4 libre
- Sérologies : toxoplasmose (IgG, IgM), rubéole, CMV, hépatite B (AgHBs), syphilis (TPHA-VDRL), VIH
- Groupe sanguin, Rhésus, RAI (recherche d'agglutinines irrégulières)
- Créatinine, urée, ionogramme (sodium, potassium)
- Vitamine D (25-OH-D)
- Bandelette urinaire (protéinurie, glycosurie) si visible

Si la photo n'est pas un compte-rendu d'analyses lisible, retourne results: [] et explique dans warnings.

Renseigne warnings (string ou null) si tu repères une valeur suspecte pendant la grossesse, SANS poser de diagnostic — formule en mode "à montrer à ta sage-femme". Exemples de cas à signaler :
- hémoglobine basse (anémie possible)
- plaquettes basses (thrombopénie)
- glycémie à jeun ≥ 0,92 g/L ou HGPO anormale (diabète gestationnel possible)
- TSH hors normes grossesse (1er trimestre <0,1 ou >2,5 mUI/L environ)
- ferritine basse (carence en fer)
- sérologie toxoplasmose ou rubéole non immunisée
- créatinine élevée
Si plusieurs valeurs sont à signaler, regroupe-les en une seule phrase courte et bienveillante.

testDate : date du prélèvement au format ISO YYYY-MM-DD si tu la lis, sinon null.
confidence : "high" si tout est net, "medium" si quelques lignes sont floues, "low" si la photo est vraiment difficile à lire.

Réponds UNIQUEMENT en JSON valide, sans texte autour.`;

const SCHEMA = {
  type: "object",
  properties: {
    testDate: { type: "string", nullable: true },
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          unit: { type: "string" },
          refMin: { type: "string", nullable: true },
          refMax: { type: "string", nullable: true },
          status: { type: "string", enum: ["low", "normal", "high", "unknown"] },
        },
        required: ["name", "value", "unit", "status"],
      },
    },
    warnings: { type: "string", nullable: true },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: ["results", "confidence"],
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
