"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { m as motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, Heart, Loader2 } from "lucide-react";

function mapResendError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("user not found") || m.includes("not found")) {
    return "Aucun compte trouvé avec cet email. Vérifiez l'adresse ou créez un compte.";
  }
  if (m.includes("already confirmed") || m.includes("email_change")) {
    return "Ce compte est déjà confirmé. Vous pouvez vous connecter.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  }
  return `Impossible d'envoyer le mail : ${message}`;
}

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendInfo(null);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Adresse email invalide");
      return;
    }
    if (!password) {
      setError("Veuillez saisir votre mot de passe");
      return;
    }

    setLoading(true);

    const { error } = await signInWithEmail(trimmedEmail, password);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setError("Votre email n'est pas encore confirmé. Cliquez sur le lien envoyé par mail ou renvoyez-en un.");
        setShowResend(true);
      } else if (error.message === "Invalid login credentials") {
        setError("Email ou mot de passe incorrect.");
        setShowResend(true);
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
      setLoading(false);
    } else {
      const inviteToken = sessionStorage.getItem("invite_token");
      if (inviteToken) {
        sessionStorage.removeItem("invite_token");
        router.push(`/invite?token=${inviteToken}`);
      } else {
        router.push("/");
      }
    }
  };

  const handleResend = async () => {
    setError(null);
    setResendInfo(null);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Saisissez d'abord votre email avant de renvoyer la confirmation.");
      return;
    }

    setResending(true);

    try {
      const supabase = createClient();
      const inviteToken = typeof window !== "undefined" ? sessionStorage.getItem("invite_token") : null;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectTo = inviteToken
        ? `${appUrl}/auth/callback?next=${encodeURIComponent(`/invite?token=${inviteToken}`)}`
        : `${appUrl}/auth/callback`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        setError(mapResendError(error.message));
      } else {
        setResendInfo(`Un nouveau lien de confirmation a été envoyé à ${trimmedEmail}. Vérifiez votre boîte mail (et vos spams).`);
      }
    } catch (err) {
      setError(mapResendError(err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-pink-50 via-white to-purple-50 dark:from-[#0f0f1a] dark:via-[#0f0f1a] dark:to-[#1a1a2e]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-3xl shadow-lg mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          >
            <Heart className="w-10 h-10 text-white fill-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">MamaTrack</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Suivez votre grossesse en toute sérénité</p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Connexion
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          {resendInfo && (
            <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl mb-4 text-center">
              {resendInfo}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 cursor-pointer select-none"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-pink-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full mt-3 text-sm text-purple-600 dark:text-purple-400 font-medium py-2 hover:text-purple-700 dark:hover:text-purple-300 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Renvoyer le mail de confirmation
            </button>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Pas encore de compte ?{" "}
            <Link
              href="/auth/signup"
              className="text-pink-500 dark:text-pink-400 font-medium hover:text-pink-600 dark:hover:text-pink-300"
            >
              Créer un compte
            </Link>
          </p>
        </motion.div>

        <motion.p
          className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          En vous connectant, vous acceptez nos conditions d&apos;utilisation
        </motion.p>
      </div>
    </div>
  );
}
