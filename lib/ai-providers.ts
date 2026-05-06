import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  GoogleGenerativeAI,
  type Content,
  type GenerativeModel,
} from "@google/generative-ai";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const GEMINI_TEXT_MODEL = "gemini-2.0-flash";
const GEMINI_VISION_MODEL = "gemini-2.0-flash";

let anthropicClient: Anthropic | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function getGemini(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatArgs {
  systemBlocks: { text: string; cache?: boolean }[];
  history: ChatMessage[];
  userMessage?: string;
  maxTokens?: number;
}

function shouldFallback(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof Anthropic.APIError) {
    const s = err.status ?? 0;
    if (s === 429 || s === 529 || s === 503 || s === 500 || s === 502 || s === 504) return true;
    const msg = (err.message ?? "").toLowerCase();
    if (msg.includes("overloaded") || msg.includes("rate limit") || msg.includes("quota")) return true;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("overloaded") || msg.includes("quota") || msg.includes("timeout")) return true;
  }
  return false;
}

function buildAnthropicMessages(history: ChatMessage[], userMessage?: string): { role: "user" | "assistant"; content: string }[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of history) {
    const text = (m.content ?? "").toString().slice(0, 4000);
    if (text.trim()) out.push({ role: m.role, content: text });
  }
  if (userMessage) out.push({ role: "user", content: userMessage });
  if (out.length === 0 || out[out.length - 1].role !== "user") {
    out.push({ role: "user", content: "Bonjour" });
  }
  return out;
}

function buildGeminiContents(history: ChatMessage[], userMessage?: string): Content[] {
  const out: Content[] = [];
  for (const m of history) {
    const text = (m.content ?? "").toString().slice(0, 4000);
    if (!text.trim()) continue;
    out.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text }] });
  }
  if (userMessage) out.push({ role: "user", parts: [{ text: userMessage }] });
  if (out.length === 0 || out[out.length - 1].role !== "user") {
    out.push({ role: "user", parts: [{ text: "Bonjour" }] });
  }
  return out;
}

async function streamGemini(
  model: GenerativeModel,
  systemText: string,
  history: ChatMessage[],
  userMessage: string | undefined,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
): Promise<void> {
  const result = await model.generateContentStream({
    contents: buildGeminiContents(history, userMessage),
    systemInstruction: { role: "system", parts: [{ text: systemText }] },
  });
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) controller.enqueue(encoder.encode(text));
  }
}

export function streamChat(args: StreamChatArgs): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const anthropic = getAnthropic();
  const gemini = getGemini();
  const systemText = args.systemBlocks.map((b) => b.text).join("\n\n");

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let primaryError: unknown = null;

      if (anthropic) {
        try {
          const stream = anthropic.messages.stream({
            model: ANTHROPIC_MODEL,
            max_tokens: args.maxTokens ?? 800,
            system: args.systemBlocks.map((b) => ({
              type: "text" as const,
              text: b.text,
              ...(b.cache ? { cache_control: { type: "ephemeral" as const } } : {}),
            })),
            messages: buildAnthropicMessages(args.history, args.userMessage),
          });
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          await stream.finalMessage();
          controller.close();
          return;
        } catch (err) {
          primaryError = err;
          if (!shouldFallback(err)) {
            const msg = err instanceof Error ? err.message : "erreur inconnue";
            controller.enqueue(encoder.encode(`\n\n[Désolée, je ne peux pas répondre maintenant — ${msg}]`));
            controller.close();
            return;
          }
        }
      }

      if (gemini) {
        try {
          const model = gemini.getGenerativeModel({
            model: GEMINI_TEXT_MODEL,
            generationConfig: { maxOutputTokens: args.maxTokens ?? 800, temperature: 0.7 },
          });
          await streamGemini(model, systemText, args.history, args.userMessage, controller, encoder);
          controller.close();
          return;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "erreur inconnue";
          controller.enqueue(encoder.encode(`\n\n[Désolée, je ne peux pas répondre maintenant — fallback Gemini KO : ${msg}]`));
          controller.close();
          return;
        }
      }

      const msg = primaryError instanceof Error ? primaryError.message : "aucun fournisseur IA disponible";
      controller.enqueue(encoder.encode(`\n\n[Service IA indisponible — ${msg}]`));
      controller.close();
    },
  });
}

export interface AnalyzeImageArgs {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  responseSchema?: object;
}

const CLAUDE_VISION_MIME = /^image\/(jpeg|png|gif|webp)$/;

function extractJson(raw: string): string {
  // Claude sometimes wraps JSON in ```json fences or adds a leading sentence.
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

async function analyzeImageWithClaude(client: Anthropic, args: AnalyzeImageArgs): Promise<string> {
  const promptWithSchema = args.responseSchema
    ? `${args.prompt}\n\nSchéma JSON attendu :\n${JSON.stringify(args.responseSchema)}\n\nRetourne UNIQUEMENT un objet JSON valide qui respecte ce schéma. Aucun texte avant ou après. Pas de balises markdown.`
    : args.prompt;

  const mediaType = args.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  const message = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: args.imageBase64 },
          },
          { type: "text", text: promptWithSchema },
        ],
      },
    ],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse Claude vide");
  }
  return args.responseSchema ? extractJson(textBlock.text) : textBlock.text;
}

async function analyzeImageWithGemini(client: GoogleGenerativeAI, args: AnalyzeImageArgs): Promise<string> {
  const model = client.getGenerativeModel({
    model: GEMINI_VISION_MODEL,
    generationConfig: args.responseSchema
      ? {
          temperature: 0.1,
          responseMimeType: "application/json",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          responseSchema: args.responseSchema as any,
        }
      : { temperature: 0.2 },
  });
  const result = await model.generateContent([
    { text: args.prompt },
    { inlineData: { mimeType: args.mimeType, data: args.imageBase64 } },
  ]);
  return result.response.text();
}

export async function analyzeImage(args: AnalyzeImageArgs): Promise<string> {
  const anthropic = getAnthropic();
  const gemini = getGemini();
  const claudeCanHandle = anthropic && CLAUDE_VISION_MIME.test(args.mimeType);

  if (claudeCanHandle && anthropic) {
    try {
      return await analyzeImageWithClaude(anthropic, args);
    } catch (err) {
      if (!gemini) throw err;
      if (!shouldFallback(err)) {
        // Non-retryable error: still try Gemini once as a safety net.
        try {
          return await analyzeImageWithGemini(gemini, args);
        } catch {
          throw err;
        }
      }
      // Retryable: fall through to Gemini.
    }
  }

  if (gemini) {
    return await analyzeImageWithGemini(gemini, args);
  }

  if (anthropic && !claudeCanHandle) {
    throw new Error(
      `Format d'image non supporté par Claude (${args.mimeType}). Configurez GEMINI_API_KEY pour les formats HEIC/HEIF.`,
    );
  }
  throw new Error("Aucun fournisseur IA vision configuré (ANTHROPIC_API_KEY ou GEMINI_API_KEY)");
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);
}

export function isVisionConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);
}
