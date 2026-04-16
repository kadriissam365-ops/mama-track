"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getSmartReminders, type Reminder } from "@/lib/smart-reminders";

export default function ReminderBanner() {
  const store = useStore();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    if (store.loading) return;

    const reminders = getSmartReminders({
      weightEntries: store.weightEntries,
      waterIntake: store.waterIntake,
      appointments: store.appointments,
      kickSessions: store.kickSessions,
      checklistItems: store.checklistItems,
      dueDate: store.dueDate,
    });

    const first = reminders.find(r => !dismissed.has(r.id));
    setReminder(first ?? null);
  }, [store, dismissed]);

  const handleDismiss = () => {
    if (reminder) {
      setDismissed(prev => new Set([...prev, reminder.id]));
    }
  };

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          key={reminder.id}
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mb-2 mt-2"
        >
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-200 dark:border-pink-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">
              {reminder.message}
            </p>
            <button
              onClick={handleDismiss}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-300 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
