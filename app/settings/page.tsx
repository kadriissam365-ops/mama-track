"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import NotificationSettings from "@/components/NotificationSettings";
import { Settings, User, Bell, LogOut, Calendar, Baby, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const store = useStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications">("profile");
  const [saving, setSaving] = useState(false);

  const [mamaName, setMamaName] = useState(store.mamaName ?? "");
  const [babyName, setBabyName] = useState(store.babyName ?? "");
  const [dueDate, setDueDate] = useState(store.dueDate ?? "");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    setMamaName(store.mamaName ?? "");
    setBabyName(store.babyName ?? "");
    setDueDate(store.dueDate ?? "");
  }, [store.mamaName, store.babyName, store.dueDate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await store.setProfile({
        mamaName: mamaName.trim() || undefined,
        babyName: babyName.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info("Déconnexion...");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Minimum 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSavingPwd(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Erreur lors du changement");
    } else {
      toast.success("Mot de passe mis à jour !");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPwd(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-[#3d2b2b] flex items-center gap-2">
        <Settings className="w-6 h-6 text-pink-400" />
        Paramètres
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "profile"
              ? "bg-white text-pink-600 shadow-sm"
              : "text-gray-500 hover:text-pink-400"
          }`}
        >
          <User className="w-4 h-4" />
          Profil
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "notifications"
              ? "bg-white text-pink-600 shadow-sm"
              : "text-gray-500 hover:text-pink-400"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
      </div>

      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* User info */}
          {user && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
              <p className="text-xs text-gray-500 mb-1">Connecté avec</p>
              <p className="text-sm font-medium text-gray-800">{user.email}</p>
            </div>
          )}

          {/* Profile form */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
            <h3 className="font-semibold text-[#3d2b2b]">Mon profil</h3>

            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <User className="w-3 h-3" />
                Prénom
              </label>
              <input
                type="text"
                value={mamaName}
                onChange={(e) => setMamaName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full border border-pink-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Baby className="w-3 h-3" />
                Prénom de bébé
              </label>
              <input
                type="text"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Optionnel"
                className="w-full border border-pink-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                Date prévue d&apos;accouchement
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-pink-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
          </div>

          {/* Sync status */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Synchronisation</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  store.synced
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {store.synced ? "✓ Synchronisé" : "Mode hors ligne"}
              </span>
            </div>
          </div>

          {/* Change password */}
          {user?.app_metadata?.provider === "email" && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-4">
              <h3 className="font-semibold text-[#3d2b2b] flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" />
                Changer le mot de passe
              </h3>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full border border-pink-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showNewPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full border border-pink-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                onClick={handleChangePassword}
                disabled={savingPwd || !newPassword}
                className="w-full py-2.5 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {savingPwd ? <><Loader2 className="w-4 h-4 animate-spin" />Mise à jour...</> : "Mettre à jour"}
              </button>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-white border border-red-200 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </motion.div>
      )}

      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NotificationSettings userId={user?.id} />
        </motion.div>
      )}
    </div>
  );
}
