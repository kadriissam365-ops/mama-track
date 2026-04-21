"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";

const NotificationSettings = dynamic(() => import("@/components/NotificationSettings"), {
  ssr: false,
  loading: () => <div className="space-y-3"><Skeleton className="h-20 w-full rounded-2xl" /><Skeleton className="h-20 w-full rounded-2xl" /><Skeleton className="h-20 w-full rounded-2xl" /></div>,
});
const AppleHealthSync = dynamic(() => import("@/components/AppleHealthSync"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full rounded-3xl" />,
});
const DataExport = dynamic(() => import("@/components/DataExport"), {
  ssr: false,
  loading: () => <div className="space-y-3"><Skeleton className="h-48 w-full rounded-3xl" /><Skeleton className="h-32 w-full rounded-3xl" /></div>,
});
import { Settings, User, Bell, LogOut, Calendar, Baby, Loader2, Lock, Eye, EyeOff, Sun, Moon, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase";
import { useTranslation, LanguageSwitcher } from "@/lib/i18n";
import {
  calculateDueDateFromDDR,
  calculateDueDateFromConception,
  calculateDueDateFIV,
  calculateDueDateFromPonction,
  calculateDueDateFromCurrentWeek,
} from "@/lib/pregnancy-data";

type DpaMethod = "ddr" | "conception" | "fiv_frais" | "fiv_tec" | "current_week";
type FivStade = "J3" | "J5";
type WeekMode = "SA" | "GA";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const store = useStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications">("profile");
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const [mamaName, setMamaName] = useState(store.mamaName ?? "");
  const [babyName, setBabyName] = useState(store.babyName ?? "");
  const [dueDate, setDueDate] = useState(store.dueDate ?? "");

  // DPA calculator
  const [dpaOpen, setDpaOpen] = useState(false);
  const [dpaMethod, setDpaMethod] = useState<DpaMethod>("current_week");
  const [ddrDate, setDdrDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");
  const [ponctionDate, setPonctionDate] = useState("");
  const [transfertDate, setTransfertDate] = useState("");
  const [fivStade, setFivStade] = useState<FivStade>("J5");
  const [currentWeeks, setCurrentWeeks] = useState("");
  const [currentDays, setCurrentDays] = useState("0");
  const [weekMode, setWeekMode] = useState<WeekMode>("SA");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const computedDpa = (): string => {
    try {
      if (dpaMethod === "ddr" && ddrDate) {
        return calculateDueDateFromDDR(new Date(ddrDate)).toISOString().split("T")[0];
      }
      if (dpaMethod === "conception" && conceptionDate) {
        return calculateDueDateFromConception(new Date(conceptionDate)).toISOString().split("T")[0];
      }
      if (dpaMethod === "fiv_frais" && ponctionDate) {
        return calculateDueDateFromPonction(new Date(ponctionDate)).toISOString().split("T")[0];
      }
      if (dpaMethod === "fiv_tec" && transfertDate) {
        return calculateDueDateFIV(new Date(transfertDate), fivStade).toISOString().split("T")[0];
      }
      if (dpaMethod === "current_week" && currentWeeks) {
        const w = parseInt(currentWeeks, 10);
        const d = parseInt(currentDays || "0", 10);
        if (!isNaN(w) && w >= 0 && w <= 42 && !isNaN(d) && d >= 0 && d <= 6) {
          return calculateDueDateFromCurrentWeek(w, d, weekMode).toISOString().split("T")[0];
        }
      }
    } catch {
      // ignore
    }
    return "";
  };

  const previewDpa = computedDpa();
  const [applyingDpa, setApplyingDpa] = useState(false);

  const applyComputedDpa = async () => {
    if (!previewDpa) return;
    setApplyingDpa(true);
    try {
      await store.setProfile({ dueDate: previewDpa });
      setDueDate(previewDpa);
      setDpaOpen(false);
      toast.success("DPA enregistrée ✓");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Enregistrement impossible";
      toast.error(msg);
    } finally {
      setApplyingDpa(false);
    }
  };

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
      toast.success(t("settings.profileUpdated"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("settings.saveError");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    toast.info(t("settings.signingOut"));
    await signOut();
    router.push("/auth/login");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error(t("settings.minChars"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.passwordMismatch"));
      return;
    }
    setSavingPwd(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(t("settings.passwordError"));
    } else {
      toast.success(t("settings.passwordUpdated"));
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPwd(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
        <Settings className="w-6 h-6 text-pink-400" />
        {t("settings.title")}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "profile"
              ? "bg-white dark:bg-gray-900 text-pink-600 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-pink-400"
          }`}
        >
          <User className="w-4 h-4" />
          {t("settings.profile")}
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "notifications"
              ? "bg-white dark:bg-gray-900 text-pink-600 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-pink-400"
          }`}
        >
          <Bell className="w-4 h-4" />
          {t("settings.notifications")}
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
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("settings.connectedWith")}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.email}</p>
            </div>
          )}

          {/* Profile form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 space-y-4">
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">{t("settings.myProfile")}</h3>

            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                <User className="w-3 h-3" />
                {t("settings.firstName")}
              </label>
              <input
                type="text"
                value={mamaName}
                onChange={(e) => setMamaName(e.target.value)}
                placeholder={t("settings.firstNamePlaceholder")}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Baby className="w-3 h-3" />
                {t("settings.babyName")}
              </label>
              <input
                type="text"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder={t("common.optional")}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                {t("settings.dueDate")}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>

            {/* DPA calculator */}
            <div>
              <button
                type="button"
                onClick={() => setDpaOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 transition-colors text-sm"
              >
                <span className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
                  <Calculator className="w-4 h-4" />
                  Calculer ma DPA autrement
                </span>
                {dpaOpen ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-purple-500" />}
              </button>

              {dpaOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-3 p-4 rounded-xl bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20"
                >
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "current_week" as DpaMethod, label: "🤰 Depuis ma semaine actuelle", desc: "SA ou GA" },
                      { value: "ddr" as DpaMethod, label: "🗓️ Depuis ma DDR", desc: "Dernières règles + 280 j" },
                      { value: "conception" as DpaMethod, label: "💕 Date de conception", desc: "Conception + 266 j" },
                      { value: "fiv_frais" as DpaMethod, label: "🔬 FIV — ponction", desc: "Ponction + 266 j" },
                      { value: "fiv_tec" as DpaMethod, label: "🧊 FIV TEC — transfert", desc: "Selon J3 / J5" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDpaMethod(opt.value)}
                        className={`text-left px-3 py-2 rounded-lg border-2 text-xs transition-all ${
                          dpaMethod === opt.value
                            ? "border-purple-400 bg-white dark:bg-gray-900"
                            : "border-transparent bg-white/50 dark:bg-gray-900/50"
                        }`}
                      >
                        <p className="font-medium text-gray-800 dark:text-gray-100">{opt.label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {dpaMethod === "current_week" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="42"
                            value={currentWeeks}
                            onChange={(e) => setCurrentWeeks(e.target.value)}
                            placeholder="ex: 20"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-sm text-gray-800 dark:text-gray-100"
                          />
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 text-center">Semaines</p>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="6"
                            value={currentDays}
                            onChange={(e) => setCurrentDays(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-center text-sm text-gray-800 dark:text-gray-100"
                          />
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 text-center">Jours 0–6</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(["SA", "GA"] as WeekMode[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setWeekMode(m)}
                            className={`flex-1 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                              weekMode === m
                                ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                            }`}
                          >
                            {m === "SA" ? "SA (aménorrhée)" : "GA (grossesse)"}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug bg-pink-50 dark:bg-pink-950/20 rounded-lg p-2">
                        <strong>SA</strong> (depuis la DDR, 40 SA) vs <strong>GA</strong> (depuis la conception, 38 GA). Relation : <strong>SA = GA + 2</strong>.
                      </p>
                    </div>
                  )}

                  {dpaMethod === "ddr" && (
                    <input
                      type="date"
                      value={ddrDate}
                      onChange={(e) => setDdrDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
                    />
                  )}
                  {dpaMethod === "conception" && (
                    <input
                      type="date"
                      value={conceptionDate}
                      onChange={(e) => setConceptionDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
                    />
                  )}
                  {dpaMethod === "fiv_frais" && (
                    <input
                      type="date"
                      value={ponctionDate}
                      onChange={(e) => setPonctionDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
                    />
                  )}
                  {dpaMethod === "fiv_tec" && (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={transfertDate}
                        onChange={(e) => setTransfertDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800 dark:text-gray-100"
                      />
                      <div className="flex gap-2">
                        {(["J3", "J5"] as FivStade[]).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFivStade(s)}
                            className={`flex-1 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                              fivStade === s
                                ? "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                            }`}
                          >
                            {s} {s === "J3" ? "(+263j)" : "(+261j)"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewDpa && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-purple-200 dark:border-purple-800/30 text-center">
                      <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium uppercase tracking-wide">DPA calculée</p>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {new Date(previewDpa).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <button
                        type="button"
                        onClick={applyComputedDpa}
                        disabled={applyingDpa}
                        className="mt-2 w-full py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        {applyingDpa ? <><Loader2 className="w-3 h-3 animate-spin" />Enregistrement…</> : "Utiliser et enregistrer"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("common.save")
              )}
            </button>
          </div>

          {/* Dark mode toggle */}
          <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl p-4 border border-pink-100 dark:border-pink-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("settings.darkMode")}</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-purple-400' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 shadow transition-all ${
                theme === 'dark' ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Sync status */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{t("settings.sync")}</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  store.synced
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {store.synced ? `✓ ${t("settings.synced")}` : t("settings.offlineMode")}
              </span>
            </div>
          </div>

          {/* Change password — available for email-based accounts (no Google SSO) */}
          {user && user.app_metadata?.provider !== "google" && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 space-y-4">
              <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" />
                {t("settings.changePassword")}
              </h3>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("settings.newPassword")}
                  className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showNewPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("settings.confirmPassword")}
                className="w-full border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
              <button
                onClick={handleChangePassword}
                disabled={savingPwd || !newPassword}
                className="w-full py-2.5 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-500 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {savingPwd ? <><Loader2 className="w-4 h-4 animate-spin" />{t("settings.updating")}</> : t("settings.update")}
              </button>
            </div>
          )}

          {/* Apple Health Sync */}
          <AppleHealthSync />

          {/* GDPR Data Export & Account Deletion */}
          <DataExport />

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800/30 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t("settings.signOut")}
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
