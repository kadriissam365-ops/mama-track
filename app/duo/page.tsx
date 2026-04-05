"use client";

import { useState, useEffect } from "react";
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
  User,
  Loader2,
} from "lucide-react";

type Role = "papa" | "sagefemme" | "famille";

const ROLE_LABELS: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  papa: { label: "Papa", icon: Heart, color: "pink" },
  sagefemme: { label: "Sage-femme", icon: Stethoscope, color: "purple" },
  famille: { label: "Famille", icon: Users, color: "green" },
};

export default function DuoPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<DuoInvitation[]>([]);
  const [partners, setPartners] = useState<DuoAccess[]>([]);
  
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
        
        // Show share URL
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

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3d2b2b] flex items-center gap-2">
          <Users className="w-6 h-6 text-pink-400" />
          Mode Duo
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-pink-400 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Inviter
        </button>
      </div>

      {/* Intro */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
        <p className="text-sm text-gray-600">
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
            className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 overflow-hidden"
          >
            <h3 className="font-semibold text-[#3d2b2b] mb-4">Nouvelle invitation</h3>
            
            {/* Role selection */}
            <label className="text-xs text-gray-500 block mb-2">Type de partage</label>
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
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={selected ? { borderColor: `var(--color-${color}-400)` } : undefined}
                  >
                    <Icon className={`w-5 h-5 ${selected ? `text-${color}-500` : "text-gray-400"}`} />
                    <span className={`text-xs font-medium ${selected ? `text-${color}-600` : "text-gray-500"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Email input */}
            <label className="text-xs text-gray-500 block mb-1.5">Email</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-pink-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <button
                onClick={handleSendInvitation}
                disabled={!email.trim() || sending}
                className="bg-pink-400 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Un lien d&apos;invitation sera généré. Partagez-le avec la personne de votre choix.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                  className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{inv.email}</p>
                        <p className="text-xs text-gray-400">{label} • En attente</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyInviteUrl(inv.token)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        aria-label="Copier le lien d'invitation"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCancelInvitation(inv.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                  className="bg-white rounded-2xl p-4 shadow-sm border border-green-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-green-500">✓ Connecté</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeAccess(partner.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
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
        <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-sm">
          <Users className="w-12 h-12 text-pink-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Aucun partage actif</h3>
          <p className="text-sm text-gray-500 mb-4">
            Invitez votre partenaire ou sage-femme à suivre votre grossesse.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-400 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-pink-500 transition-colors"
          >
            Créer une invitation
          </button>
        </div>
      )}
    </div>
  );
}
