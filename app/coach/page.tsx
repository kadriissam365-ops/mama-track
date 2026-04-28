"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  "Mes kicks sont normaux ?",
  "Que manger cette semaine ?",
  "J'ai mal au dos, que faire ?",
];

function newId() {
  return Math.random().toString(36).slice(2);
}

export default function CoachPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [weeklyTip, setWeeklyTip] = useState("");
  const [tipLoading, setTipLoading] = useState(true);
  const [tipError, setTipError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedTipRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (fetchedTipRef.current) return;
    fetchedTipRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "weekly_tip" }),
        });
        if (!res.ok || !res.body) {
          setTipError(true);
          setTipLoading(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        setTipLoading(false);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          setWeeklyTip(buf);
        }
      } catch {
        setTipError(true);
        setTipLoading(false);
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const assistantId = newId();
    const next = [...messages, userMsg];
    setMessages([...next, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(res.status === 401 ? "Tu dois te reconnecter." : "Erreur serveur.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Désolée, je n'ai pas pu répondre.";
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: message } : m))
      );
      toast.error(message);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleQuickAction(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  if (authLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-[#3d2b2b] dark:text-gray-100">
          Connexion requise
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          MamaCoach a besoin d&apos;accéder à ton suivi pour te répondre. Connecte-toi pour démarrer.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-40 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#3d2b2b] dark:text-gray-100">MamaCoach</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sage-femme virtuelle, à ton écoute</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-pink-100 via-purple-50 to-emerald-50 dark:from-pink-950/40 dark:via-purple-950/30 dark:to-emerald-950/20 border border-pink-100 dark:border-pink-900/30 rounded-3xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-300" />
          <h2 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">Tip de la semaine</h2>
        </div>
        {tipLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Préparation de ton conseil personnalisé...
          </div>
        ) : tipError ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Conseil indisponible pour le moment. Réessaie plus tard.
          </p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {weeklyTip}
            {isStreaming && weeklyTip === "" ? "..." : null}
          </p>
        )}
      </motion.div>

      <div
        ref={scrollRef}
        className="space-y-3 max-h-[55vh] overflow-y-auto pr-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-pink-400 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-900 text-[#3d2b2b] dark:text-gray-100 border border-pink-100 dark:border-pink-900/30 rounded-bl-md"
                }`}
              >
                {m.content || (m.role === "assistant" && isStreaming ? (
                  <span className="inline-flex gap-1 items-end">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
                  </span>
                ) : null)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white dark:from-gray-950 dark:via-gray-950 to-transparent pt-4 pb-[max(env(safe-area-inset-bottom),5rem)] px-4">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => handleQuickAction(a)}
                disabled={isStreaming}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-900/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors disabled:opacity-40"
              >
                {a}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              placeholder="Pose ta question à MamaCoach..."
              className="flex-1 bg-white dark:bg-gray-900 border border-pink-200 dark:border-pink-900/40 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-600 dark:text-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Envoyer"
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          <div className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              MamaCoach est un assistant. En cas d&apos;urgence, contacte ton médecin, ta sage-femme ou le 15.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
