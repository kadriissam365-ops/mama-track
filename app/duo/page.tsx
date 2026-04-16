"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import {
  createInvitation,
  getPendingInvitations,
  getActivePartners,
  cancelInvitation,
  revokeAccess,
  type DuoInvitation,
  type DuoAccess,
} from "@/lib/duo-api";
import { createClient } from "@/lib/supabase";
import {
  Users,
  Mail,
  Send,
  X,
  UserPlus,
  Copy,
  Check,
  Trash2,
  Heart,
  Stethoscope,
  Loader2,
  MessageCircle,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Role = "papa" | "sagefemme" | "famille";

const ROLE_LABELS: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  papa: { label: "Papa", icon: Heart, color: "pink" },
  sagefemme: { label: "Sage-femme", icon: Stethoscope, color: "purple" },
  famille: { label: "Famille", icon: Users, color: "green" },
};

interface DuoMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

const EMOJI_SHORTCUTS = ["❤️", "🤰", "👶", "💪", "😊", "🌸"];

const SUPPORT_MESSAGES = [
  { emoji: "❤️", text: "Je pense à toi" },
  { emoji: "💪", text: "Tu gères !" },
  { emoji: "🤗", text: "Câlin virtuel" },
  { emoji: "👶", text: "Hâte de vous voir !" },
  { emoji: "🌸", text: "Je t'aime" },
];

function ChatSection({ userId, partnerName }: { userId: string; partnerName: string | null }) {
  const [messages, setMessages] = useState<DuoMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `duo-messages-${userId}`;

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Try Supabase Realtime
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("duo-chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "duo_messages" },
          (payload) => {
            const row = payload.new as { id: string; sender_id: string; content: string; created_at: string };
            const msg: DuoMessage = {
              id: row.id,
              senderId: row.sender_id,
              content: row.content,
              createdAt: row.created_at,
              isOwn: row.sender_id === userId,
            };
            setMessages((prev) => {
              const updated = [...prev, msg];
              try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { /* ignore */ }
              return updated;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // fallback localStorage only
    }
  }, [userId, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = (msg: DuoMessage) => {
    setMessages((prev) => {
      const updated = [...prev, msg];
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    // Try to save to Supabase
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from as any)("duo_messages").insert({
        id: msg.id,
        sender_id: msg.senderId,
        content: msg.content,
        created_at: msg.createdAt,
      }).then(() => {}).catch(() => {});
    } catch {
      // ignore
    }
  };

  const sendMessage = (text: string) => {
    const content = text.trim();
    if (!content) return;
    const msg: DuoMessage = {
      id: crypto.randomUUID(),
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };
    saveMessage(msg);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (!partnerName) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-pink-900/30 text-center">
        <MessageCircle className="w-10 h-10 text-pink-200 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Invitez votre partenaire pour activer le chat
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-pink-100 dark:border-pink-900/30 bg-gradient-to-r from-pink-50 to-purple-50">
        <h2 className="font-semibold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-pink-400" />
          💬 Chat avec {partnerName}
        </h2>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto px-4 py-3 flex flex-col gap-2 bg-gray-50 dark:bg-gray-800">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">Commencez la conversation ✨</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                msg.isOwn
                  ? "bg-pink-400 text-white rounded-br-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
              }`}
            >
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-0.5 ${msg.isOwn ? "text-pink-100" : "text-gray-400 dark:text-gray-500"}`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji shortcuts */}
      <div className="flex gap-1.5 px-4 py-2 border-t border-pink-50">
        {EMOJI_SHORTCUTS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendMessage(emoji)}
            className="text-lg hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-pink-100 dark:border-pink-900/30">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre message..."
          className="flex-1 px-3 py-2 border border-pink-200 dark:border-pink-800/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          className="bg-pink-400 text-white px-3 py-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DuoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<DuoInvitation[]>([]);
  const [partners, setPartners] = useState<DuoAccess[]>([]);
  
  const [supportMessages, setSupportMessages] = useState<DuoMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("papa");
  const [sending, setSending] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('duo-support-messages');
      if (saved) setSupportMessages(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const sendSupportMessage = (content: string) => {
    if (!content.trim()) return;
    const msg: DuoMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'local',
      content: content.trim(),
      isOwn: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...supportMessages, msg];
    setSupportMessages(updated);
    try { localStorage.setItem('duo-support-messages', JSON.stringify(updated)); } catch { /* ignore */ }
    setNewMessage('');
  };

  const formatSupportTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const [invs, parts] = await Promise.all([
        getPendingInvitations(user.id),
        getActivePartners(user.id),
      ]);
      setInvitations(invs);
      setPartners(parts);
    } catch (error) {
      console.error("Error loading duo data:", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!user || !email.trim()) return;
    
    setSending(true);
    try {
      const result = await createInvitation(user.id, email.trim(), role);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Invitation créée !");
        setEmail("");
        setShowForm(false);
        
        if (result.shareUrl) {
          setCopiedUrl(result.shareUrl);
          await navigator.clipboard.writeText(result.shareUrl);
          toast.info("Lien copié dans le presse-papier !");
        }
        
        await loadData();
      }
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    const success = await cancelInvitation(id);
    if (success) {
      toast.success("Invitation annulée");
      await loadData();
    } else {
      toast.error("Erreur");
    }
  };

  const handleRevokeAccess = async (id: string) => {
    const success = await revokeAccess(id);
    if (success) {
      toast.success("Accès révoqué");
      await loadData();
    } else {
      toast.error("Erreur");
    }
  };

  const copyInviteUrl = async (token: string) => {
    const url = `${window.location.origin}/invite?token=${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Lien copié !");
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const activePartner = partners[0] ?? null;
  const partnerLabel = activePartner
    ? (ROLE_LABELS[activePartner.role as Role]?.label ?? "Partenaire")
    : null;

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }


  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Partner view button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/partner')}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-xl text-sm font-medium hover:from-pink-200 hover:to-purple-200 transition-colors border border-purple-100 dark:border-purple-900/30"
        >
          <Eye className="w-4 h-4" /> Voir la vue partenaire
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-pink-400" />
          Mode Duo
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-pink-400 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Inviter
        </button>
      </div>

      {/* Intro */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Partagez votre suivi de grossesse avec votre partenaire, sage-femme ou famille. 
          Ils pourront suivre votre progression en lecture seule.
        </p>
      </div>

      {/* Invitation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden"
          >
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-4">Nouvelle invitation</h3>
            
            {/* Role selection */}
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">Type de partage</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => {
                const { label, icon: Icon, color } = ROLE_LABELS[r];
                const selected = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      selected
                        ? `border-${color}-400 bg-${color}-50`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600"
                    }`}
                    style={selected ? { borderColor: `var(--color-${color}-400)` } : undefined}
                  >
                    <Icon className={`w-5 h-5 ${selected ? `text-${color}-500` : "text-gray-400 dark:text-gray-500"}`} />
                    <span className={`text-xs font-medium ${selected ? `text-${color}-600` : "text-gray-500 dark:text-gray-400"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Email input */}
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">Email</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-pink-200 dark:border-pink-800/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <button
                onClick={handleSendInvitation}
                disabled={!email.trim() || sending}
                className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Un lien d&apos;invitation sera généré. Partagez-le avec la personne de votre choix.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Invitations en attente ({invitations.length})
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => {
              const { label, icon: Icon, color } = ROLE_LABELS[inv.role as Role] || ROLE_LABELS.famille;
              const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite?token=${inv.token}`;
              const isCopied = copiedUrl === inviteUrl;
              
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-yellow-100 dark:border-yellow-900/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{inv.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{label} • En attente</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyInviteUrl(inv.token)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:bg-gray-700 transition-colors"
                        aria-label="Copier le lien d'invitation"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCancelInvitation(inv.id)}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-400 hover:bg-red-100 dark:bg-red-900/30 transition-colors"
                        aria-label="Annuler l'invitation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Partners */}
      {partners.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Partenaires actifs ({partners.length})
          </h2>
          <div className="space-y-2">
            {partners.map((partner) => {
              const { label, icon: Icon, color } = ROLE_LABELS[partner.role as Role] || ROLE_LABELS.famille;
              
              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-green-100 dark:border-green-900/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                        <p className="text-xs text-green-500">✓ Connecté</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeAccess(partner.id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-400 hover:bg-red-100 dark:bg-red-900/30 transition-colors"
                      aria-label="Révoquer l'accès partenaire"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {invitations.length === 0 && partners.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-pink-100 dark:border-pink-900/30 shadow-sm">
          <Users className="w-12 h-12 text-pink-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Aucun partage actif</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Invitez votre partenaire ou sage-femme à suivre votre grossesse.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-400 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
          >
            Créer une invitation
          </button>
        </div>
      )}

      {/* Chat Section */}
      {user && (
        <ChatSection
          userId={user.id}
          partnerName={partnerLabel}
        />
      )}

      {/* Messages de soutien */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-pink-400" />
          Messages de soutien
        </h3>

        {/* Messages rapides */}
        <div className="flex gap-2 flex-wrap mb-3">
          {SUPPORT_MESSAGES.map(msg => (
            <button key={msg.text} onClick={() => sendSupportMessage(msg.text)}
              className="text-xs bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-900/30 dark:bg-pink-900/30 text-pink-600 rounded-full px-3 py-1.5 transition-colors">
              {msg.emoji} {msg.text}
            </button>
          ))}
        </div>

        {/* Liste messages */}
        <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
          {supportMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                msg.isOwn ? 'bg-pink-400 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                {msg.content}
                <div className="text-xs opacity-60 mt-0.5">{formatSupportTime(msg.createdAt)}</div>
              </div>
            </div>
          ))}
          {supportMessages.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
              Envoyez un premier message de soutien 💕
            </p>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendSupportMessage(newMessage)}
            placeholder="Écrire un message..."
            className="flex-1 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white" />
          <button onClick={() => sendSupportMessage(newMessage)}
            disabled={!newMessage.trim()}
            className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
