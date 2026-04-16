"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { getInvitationByToken, acceptInvitation, type DuoInvitation } from "@/lib/duo-api";
import { Heart, Stethoscope, Users, Loader2, CheckCircle, XCircle, UserPlus } from "lucide-react";

type Role = "papa" | "sagefemme" | "famille";

const ROLE_LABELS: Record<Role, { label: string; icon: React.ElementType; description: string }> = {
  papa: { 
    label: "Papa", 
    icon: Heart, 
    description: "Vous pourrez suivre la grossesse, voir les rendez-vous et les mouvements de bébé."
  },
  sagefemme: { 
    label: "Sage-femme", 
    icon: Stethoscope,
    description: "Accès aux données de suivi pour un accompagnement personnalisé."
  },
  famille: { 
    label: "Famille", 
    icon: Users,
    description: "Suivez la progression de la grossesse et restez informé."
  },
};

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<DuoInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Lien d'invitation invalide");
      setLoading(false);
      return;
    }
    
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const inv = await getInvitationByToken(token);
      
      if (!inv) {
        setError("Invitation non trouvée ou expirée");
      } else if (inv.acceptedAt) {
        setError("Cette invitation a déjà été acceptée");
      } else {
        setInvitation(inv);
      }
    } catch {
      setError("Erreur lors du chargement de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !token) return;
    
    setAccepting(true);
    try {
      const success = await acceptInvitation(token, user.id);
      
      if (success) {
        setAccepted(true);
        toast.success("Invitation acceptée !");
        setTimeout(() => router.push("/"), 2000);
      } else {
        toast.error("Erreur lors de l'acceptation");
      }
    } catch {
      toast.error("Erreur");
    } finally {
      setAccepting(false);
    }
  };

  const handleLogin = () => {
    // Store token in sessionStorage to restore after login
    if (typeof window !== 'undefined' && token) {
      sessionStorage.setItem('invite_token', token);
    }
    router.push('/auth/login');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-red-900/30 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oups !</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-pink-400 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </motion.div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-green-100 dark:border-green-900/30 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">C&apos;est fait !</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vous avez maintenant accès au suivi de grossesse.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const roleInfo = ROLE_LABELS[invitation.role as Role] || ROLE_LABELS.famille;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-pink-100 dark:border-pink-900/30 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <RoleIcon className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Invitation MamaTrack
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Vous êtes invité(e) en tant que <span className="font-semibold text-pink-500">{roleInfo.label}</span>
          </p>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            {roleInfo.description}
          </p>
        </div>

        {/* What you can do */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ce que vous pourrez voir :</h3>
          <ul className="space-y-2">
            {[
              "📅 Semaine de grossesse et DPA",
              "👶 Développement du bébé",
              "📊 Poids et symptômes",
              "⏱️ Mouvements et contractions",
              "🏥 Rendez-vous médicaux",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Action */}
        {user ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Acceptation...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Accepter l&apos;invitation
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Connectez-vous pour accepter cette invitation
            </p>
            <button
              onClick={handleLogin}
              className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
            >
              Se connecter
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
