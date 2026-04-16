"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Droplets,
  Pill,
  Calendar,
  Check,
  Send,
  Baby,
  Heart,
  Users,
  Lightbulb,
  Trophy,
  TestTube,
  Loader2,
} from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  initializeNotifications,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
  sendPushNotification,
  type NotificationSettings as Settings,
} from "@/lib/notifications";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/supabase-api";
import type { NotificationPreferences } from "@/lib/notification-scheduler";
import { DEFAULT_PREFERENCES } from "@/lib/notification-scheduler";

interface NotificationSettingsProps {
  userId?: string;
}

// Toggle component to reduce repetition
function Toggle({
  enabled,
  onToggle,
  color = "blue",
}: {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}) {
  const bgClass = enabled ? `bg-${color}-400` : "bg-gray-200 dark:bg-gray-700";
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors ${bgClass}`}
      style={enabled ? { backgroundColor: `var(--color-${color}, '')` } : undefined}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        className="absolute top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow"
      />
    </button>
  );
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [testSending, setTestSending] = useState(false);

  // Original settings (medication, water, appointments — existing toggles)
  const [settings, setSettings] = useState<Settings>({
    waterReminders: true,
    medicationMorning: false,
    medicationEvening: false,
    appointmentReminders: true,
    reminderIntervalHours: 2,
  });

  // Extended notification preferences (schedule API)
  const [prefs, setPrefs] = useState<Omit<NotificationPreferences, "userId">>({
    ...DEFAULT_PREFERENCES,
  });
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    getPushSubscription().then((sub) => setPushSubscribed(!!sub));

    if (userId) {
      getNotificationSettings(userId).then((data) => {
        if (data) {
          setSettings({
            waterReminders: data.waterReminders,
            medicationMorning: data.medicationMorning,
            medicationEvening: data.medicationEvening,
            appointmentReminders: data.appointmentReminders,
            reminderIntervalHours: data.reminderIntervalHours,
          });
        }
      });

      // Fetch extended preferences from schedule API
      fetch("/api/push/schedule")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.preferences) {
            const p = data.preferences;
            setPrefs({
              dailyTips: p.dailyTips ?? DEFAULT_PREFERENCES.dailyTips,
              dailyTipTime: p.dailyTipTime ?? DEFAULT_PREFERENCES.dailyTipTime,
              appointmentReminders:
                p.appointmentReminders ?? DEFAULT_PREFERENCES.appointmentReminders,
              appointmentReminderAdvance:
                p.appointmentReminderAdvance ??
                DEFAULT_PREFERENCES.appointmentReminderAdvance,
              weeklyMilestones:
                p.weeklyMilestones ?? DEFAULT_PREFERENCES.weeklyMilestones,
              hydrationReminders:
                p.hydrationReminders ?? DEFAULT_PREFERENCES.hydrationReminders,
              hydrationIntervalMinutes:
                p.hydrationIntervalMinutes ??
                DEFAULT_PREFERENCES.hydrationIntervalMinutes,
              kickCountReminders:
                p.kickCountReminders ?? DEFAULT_PREFERENCES.kickCountReminders,
              kickReminderTime:
                p.kickReminderTime ?? DEFAULT_PREFERENCES.kickReminderTime,
              partnerNotifications:
                p.partnerNotifications ?? DEFAULT_PREFERENCES.partnerNotifications,
            });
          }
          setPrefsLoaded(true);
        })
        .catch(() => setPrefsLoaded(true));
    } else {
      import("@/lib/notifications").then(
        ({ getNotificationSettings: getLocal }) => {
          setSettings(getLocal());
        }
      );
      setPrefsLoaded(true);
    }
  }, [userId]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") {
      initializeNotifications();
    }
  };

  // Save original settings (existing behavior)
  const updateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    initializeNotifications();

    if (userId) {
      await saveNotificationSettings(userId, {
        [key]: value,
      } as Partial<typeof updated>);
    } else {
      const { saveNotificationSettings: saveLocal } = await import(
        "@/lib/notifications"
      );
      saveLocal({ [key]: value });
    }
  };

  // Save extended preferences via schedule API
  const updatePref = useCallback(
    async (partial: Partial<Omit<NotificationPreferences, "userId">>) => {
      setPrefs((prev) => ({ ...prev, ...partial }));
      try {
        await fetch("/api/push/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });
      } catch (err) {
        console.error("Error saving notification preferences:", err);
      }
    },
    []
  );

  // Send a test notification
  const handleTestNotification = async () => {
    setTestSending(true);
    try {
      await sendPushNotification({
        title: "Test MamaTrack",
        body: "Les notifications push fonctionnent correctement !",
        tag: "test",
        url: "/",
      });
    } catch {
      // Try local fallback
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Test MamaTrack", {
          body: "Les notifications fonctionnent correctement !",
          icon: "/icons/icon-192x192.png",
        });
      }
    }
    setTestSending(false);
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800/30">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Les notifications ne sont pas supportees sur ce navigateur.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-200 dark:border-red-800/30">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Notifications bloquees
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Allez dans les parametres de votre navigateur pour les activer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === "default") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRequestPermission}
        className="w-full bg-pink-400 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="font-medium">Activer les notifications</span>
      </motion.button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Subscription status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-green-500 dark:text-green-400 text-sm">
          <Check className="w-4 h-4" />
          <span>Notifications activees</span>
        </div>
        {pushSubscribed && (
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 rounded-full">
            Push actif
          </span>
        )}
      </div>

      {/* Push notifications toggle */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Notifications push
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {pushSubscribed
                  ? "Recevez des rappels meme en arriere-plan"
                  : "Activez pour recevoir des rappels en arriere-plan"}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (pushSubscribed) {
                const ok = await unsubscribeFromPush();
                if (ok) setPushSubscribed(false);
              } else {
                const ok = await subscribeToPush();
                if (ok) setPushSubscribed(true);
              }
            }}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              pushSubscribed ? "bg-indigo-400" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <motion.div
              animate={{ x: pushSubscribed ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* Test notification button */}
      {pushSubscribed && (
        <button
          onClick={handleTestNotification}
          disabled={testSending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {testSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4" />
          )}
          <span>Envoyer une notification test</span>
        </button>
      )}

      {/* ─── Daily tips ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Conseil du jour
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Un conseil quotidien adapte a votre semaine
              </p>
            </div>
          </div>
          <Toggle
            enabled={prefs.dailyTips}
            onToggle={() => updatePref({ dailyTips: !prefs.dailyTips })}
            color="amber"
          />
        </div>
        {prefs.dailyTips && prefsLoaded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
              Heure d&apos;envoi
            </label>
            <input
              type="time"
              value={prefs.dailyTipTime}
              onChange={(e) => updatePref({ dailyTipTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        )}
      </div>

      {/* ─── Hydration reminders ──────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Rappels hydratation
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toutes les {Math.round(prefs.hydrationIntervalMinutes / 60)}h
                {prefs.hydrationIntervalMinutes % 60 > 0
                  ? `${prefs.hydrationIntervalMinutes % 60}min`
                  : ""}
              </p>
            </div>
          </div>
          <Toggle
            enabled={settings.waterReminders}
            onToggle={() => {
              updateSetting("waterReminders", !settings.waterReminders);
              updatePref({ hydrationReminders: !settings.waterReminders });
            }}
            color="blue"
          />
        </div>

        {settings.waterReminders && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
              Intervalle
            </label>
            <div className="flex gap-2">
              {[60, 90, 120, 180, 240].map((minutes) => {
                const label =
                  minutes >= 60
                    ? `${Math.floor(minutes / 60)}h${minutes % 60 || ""}`
                    : `${minutes}min`;
                return (
                  <button
                    key={minutes}
                    onClick={() => {
                      updateSetting(
                        "reminderIntervalHours",
                        minutes / 60
                      );
                      updatePref({ hydrationIntervalMinutes: minutes });
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      prefs.hydrationIntervalMinutes === minutes
                        ? "bg-blue-400 text-white"
                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 dark:bg-blue-900/30"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Morning medication ───────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Medicaments matin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rappel a 8h00</p>
            </div>
          </div>
          <button
            onClick={() =>
              updateSetting("medicationMorning", !settings.medicationMorning)
            }
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.medicationMorning ? "bg-pink-400" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <motion.div
              animate={{ x: settings.medicationMorning ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* ─── Evening medication ───────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Medicaments soir
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rappel a 20h00</p>
            </div>
          </div>
          <button
            onClick={() =>
              updateSetting("medicationEvening", !settings.medicationEvening)
            }
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.medicationEvening ? "bg-purple-400" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <motion.div
              animate={{ x: settings.medicationEvening ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* ─── Appointment reminders ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Rappels RDV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rappels avant chaque rendez-vous
              </p>
            </div>
          </div>
          <Toggle
            enabled={settings.appointmentReminders}
            onToggle={() => {
              updateSetting(
                "appointmentReminders",
                !settings.appointmentReminders
              );
              updatePref({
                appointmentReminders: !settings.appointmentReminders,
              });
            }}
            color="green"
          />
        </div>
        {settings.appointmentReminders && prefsLoaded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
              Rappeler
            </label>
            <div className="flex gap-2">
              {(["2h", "1d"] as const).map((advance) => {
                const active =
                  prefs.appointmentReminderAdvance.includes(advance);
                const label = advance === "2h" ? "2h avant" : "1 jour avant";
                return (
                  <button
                    key={advance}
                    onClick={() => {
                      const updated = active
                        ? prefs.appointmentReminderAdvance.filter(
                            (a) => a !== advance
                          )
                        : [...prefs.appointmentReminderAdvance, advance];
                      // Ensure at least one is selected
                      if (updated.length > 0) {
                        updatePref({ appointmentReminderAdvance: updated });
                      }
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? "bg-green-400 text-white"
                        : "bg-green-50 dark:bg-green-950/30 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 dark:bg-green-900/30"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Weekly milestones ────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-teal-100 dark:border-teal-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Etapes hebdomadaires
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notification a chaque nouvelle semaine
              </p>
            </div>
          </div>
          <Toggle
            enabled={prefs.weeklyMilestones}
            onToggle={() =>
              updatePref({ weeklyMilestones: !prefs.weeklyMilestones })
            }
            color="teal"
          />
        </div>
      </div>

      {/* ─── Kick count reminders ─────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
              <Baby className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Rappels mouvements
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rappel quotidien pour compter les mouvements
              </p>
            </div>
          </div>
          <Toggle
            enabled={prefs.kickCountReminders}
            onToggle={() =>
              updatePref({ kickCountReminders: !prefs.kickCountReminders })
            }
            color="rose"
          />
        </div>
        {prefs.kickCountReminders && prefsLoaded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
              Heure du rappel
            </label>
            <input
              type="time"
              value={prefs.kickReminderTime}
              onChange={(e) => updatePref({ kickReminderTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        )}
      </div>

      {/* ─── Partner notifications (duo mode) ─────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Mode duo (partenaire)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Partagez les etapes et rappels avec votre partenaire
              </p>
            </div>
          </div>
          <Toggle
            enabled={prefs.partnerNotifications}
            onToggle={() =>
              updatePref({
                partnerNotifications: !prefs.partnerNotifications,
              })
            }
            color="orange"
          />
        </div>
        {prefs.partnerNotifications && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-orange-600">
              <Heart className="w-3.5 h-3.5" />
              <span>
                Votre partenaire recevra les conseils hebdomadaires et les rappels de
                RDV
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
