"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Sparkles, AlertTriangle } from "lucide-react";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function CoachChat({
  babyName,
  ageLabel,
  suggestions,
  initialMessages = [],
}: {
  babyName: string;
  ageLabel: string;
  suggestions: string[];
  initialMessages?: Msg[];
}) {
  const welcome: Msg = {
    id: "welcome",
    role: "assistant",
    content: `Salut ! Je suis ton coach bébé pour **${babyName}** (${ageLabel}). Pose-moi une question sur le sommeil, l'alimentation, la diversification, la santé ou le développement. Je m'appuie sur les recommandations FR (HAS, Santé publique France, SFP).`,
  };

  const [messages, setMessages] = useState<Msg[]>([welcome, ...initialMessages]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    message: string;
    upgradeUrl?: string;
  } | null>(null);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Autoscroll bas quand un nouveau token arrive
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setLimitInfo(null);
    setInput("");

    const userMsg: Msg = { id: newId(), role: "user", content: trimmed };
    const placeholder: Msg = { id: newId(), role: "assistant", content: "" };
    const next = [...messages, userMsg, placeholder];
    setMessages(next);
    setSending(true);

    try {
      const payload = next
        .filter((m) => m.id !== "welcome" && m.id !== placeholder.id)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/enfant/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!res.ok) {
        // Try to parse JSON error (limit, auth, etc.)
        let parsed: {
          error?: string;
          message?: string;
          upgradeUrl?: string;
        } = {};
        try {
          parsed = await res.json();
        } catch {
          // not json
        }

        if (res.status === 429 && parsed.error === "daily_limit_reached") {
          setLimitInfo({
            message:
              parsed.message ??
              "Limite atteinte (5 questions gratuites par jour). Passe en Premium.",
            upgradeUrl: parsed.upgradeUrl ?? "/enfant/pricing",
          });
        }

        const errMsg =
          parsed.message ??
          (res.status === 401
            ? "Tu dois être connecté·e pour utiliser le coach."
            : res.status === 503
              ? "Le coach IA n'est pas configuré (clé API manquante)."
              : `Erreur ${res.status}.`);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholder.id ? { ...m, content: `⚠️ ${errMsg}` } : m,
          ),
        );
        return;
      }

      // Streaming text/plain
      const reader = res.body?.getReader();
      if (!reader) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholder.id
              ? { ...m, content: "⚠️ Pas de flux reçu." }
              : m,
          ),
        );
        return;
      }

      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholder.id ? { ...m, content: acc } : m,
          ),
        );
      }

      if (acc.trim().length === 0) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholder.id
              ? { ...m, content: "⚠️ Réponse vide. Réessaie." }
              : m,
          ),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur réseau.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id ? { ...m, content: `⚠️ ${msg}` } : m,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  // Affiche les suggestions tant que l'utilisateur n'a pas envoyé de message
  const showSuggestions =
    messages.filter((m) => m.role === "user").length === 0 && !sending;

  return (
    <div className="flex flex-col gap-3">
      {/* Zone messages — scroll interne pour garder le textarea collé bas */}
      <div
        ref={scrollerRef}
        className="flex h-[58vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-surface p-3 sm:h-[62vh] sm:p-4"
        aria-live="polite"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}

        {showSuggestions && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-foreground-subtle">
              Idées de questions
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={sending}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm text-foreground transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm disabled:opacity-50"
                >
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {limitInfo && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-sm text-warning-text"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="flex-1">
            <p>{limitInfo.message}</p>
            {limitInfo.upgradeUrl && (
              <Link
                href={limitInfo.upgradeUrl}
                className="mt-1 inline-block font-semibold underline"
              >
                Voir les offres Premium
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Composer (le scroll vit dans la zone messages au-dessus, donc pas besoin de sticky) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            sending
              ? "Le coach réfléchit…"
              : "Pose ta question (sommeil, repas, santé…)"
          }
          rows={1}
          disabled={sending}
          maxLength={2000}
          className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || input.trim().length === 0}
          aria-label="Envoyer"
          className="bt-bg-gradient inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm shadow-brand/30 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Disclaimer permanent */}
      <p className="px-1 text-center text-[11px] leading-relaxed text-foreground-subtle">
        Le Coach IA fournit des repères généraux issus des recommandations
        françaises (HAS, Santé publique France, SFP). Il ne remplace en aucun
        cas l&apos;avis d&apos;un pédiatre. En cas d&apos;urgence, appelle le{" "}
        <strong className="text-foreground-muted">15</strong>.
      </p>
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ role, content }: { role: Role; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span
          aria-hidden
          className="mr-2 mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      )}
      <div
        className={
          isUser
            ? "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-brand px-3.5 py-2 text-sm text-white shadow-sm"
            : "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-2 text-sm text-foreground shadow-sm"
        }
      >
        {content ? (
          renderInline(content)
        ) : (
          <span className="inline-flex items-center gap-1 text-foreground-subtle">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-subtle" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-subtle [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-subtle [animation-delay:240ms]" />
          </span>
        )}
      </div>
    </div>
  );
}
