"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Droplets, Pill, Calendar, Check } from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  initializeNotifications,
  type NotificationSettings as Settings,
} from "@/lib/notifications";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/supabase-api";

interface NotificationSettingsProps {
  userId?: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<Settings>({
    waterReminders: true,
    medicationMorning: false,
    medicationEvening: false,
    appointmentReminders: true,
    reminderIntervalHours: 2,
  });

  // Charger les settings au montage : Supabase en priorité, fallback localStorage
  useEffect(() => {
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());

    if (userId) {
      // Load from Supabase (with localStorage fallback built-in)
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
    } else {
      // No userId — use localStorage only via notifications lib
      import("@/lib/notifications").then(({ getNotificationSettings: getLocal }) => {
        setSettings(getLocal());
      });
    }
  }, [userId]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      initializeNotifications();
    }
  };

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    initializeNotifications();

    if (userId) {
      // Sauvegarder en Supabase (+ localStorage comme cache)
      await saveNotificationSettings(userId, { [key]: value } as Partial<typeof updated>);
    } else {
      // Fallback localStorage uniquement
      const { saveNotificationSettings: saveLocal } = await import("@/lib/notifications");
      saveLocal({ [key]: value });
    }
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-yellow-500" />
          <p className="text-sm text-yellow-700">
            Les notifications ne sont pas supportées sur ce navigateur.
          </p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm text-red-700 font-medium">
              Notifications bloquées
            </p>
            <p className="text-xs text-red-600 mt-1">
              Allez dans les paramètres de votre navigateur pour les activer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'default') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRequestPermission}
        className="w-full bg-pink-400 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm hover:bg-pink-500 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="font-medium">Activer les notifications</span>
      </motion.button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-green-500 text-sm mb-4">
        <Check className="w-4 h-4" />
        <span>Notifications activées</span>
      </div>

      {/* Water reminders */}
      <div className="bg-white rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Rappels hydratation</p>
              <p className="text-xs text-gray-500">Toutes les {settings.reminderIntervalHours}h</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('waterReminders', !settings.waterReminders)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.waterReminders ? 'bg-blue-400' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: settings.waterReminders ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>

        {settings.waterReminders && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <label className="text-xs text-gray-500 block mb-2">Fréquence</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((hours) => (
                <button
                  key={hours}
                  onClick={() => updateSetting('reminderIntervalHours', hours)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    settings.reminderIntervalHours === hours
                      ? 'bg-blue-400 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Morning medication */}
      <div className="bg-white rounded-2xl p-4 border border-pink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Médicaments matin</p>
              <p className="text-xs text-gray-500">Rappel à 8h00</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('medicationMorning', !settings.medicationMorning)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.medicationMorning ? 'bg-pink-400' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: settings.medicationMorning ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* Evening medication */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Médicaments soir</p>
              <p className="text-xs text-gray-500">Rappel à 20h00</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('medicationEvening', !settings.medicationEvening)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.medicationEvening ? 'bg-purple-400' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: settings.medicationEvening ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* Appointment reminders */}
      <div className="bg-white rounded-2xl p-4 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Rappels RDV</p>
              <p className="text-xs text-gray-500">24h avant chaque RDV</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('appointmentReminders', !settings.appointmentReminders)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              settings.appointmentReminders ? 'bg-green-400' : 'bg-gray-200'
            }`}
          >
            <motion.div
              animate={{ x: settings.appointmentReminders ? 20 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
