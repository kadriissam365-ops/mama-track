/**
 * Notification Scheduler for MamaTrack
 *
 * Server-side utilities to determine which notifications should be sent,
 * based on user preferences stored in the `notification_preferences` table.
 *
 * These helpers are designed to run in API route handlers or cron jobs.
 */

import { pregnancyData } from "./pregnancy-data";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  userId: string;
  dailyTips: boolean;
  dailyTipTime: string; // HH:mm
  appointmentReminders: boolean;
  appointmentReminderAdvance: ("2h" | "1d")[]; // which advance windows are active
  weeklyMilestones: boolean;
  hydrationReminders: boolean;
  hydrationIntervalMinutes: number; // e.g. 60, 90, 120, 180, 240
  kickCountReminders: boolean;
  kickReminderTime: string; // HH:mm
  partnerNotifications: boolean; // duo-mode partner alerts
}

export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, "userId"> = {
  dailyTips: true,
  dailyTipTime: "09:00",
  appointmentReminders: true,
  appointmentReminderAdvance: ["2h", "1d"],
  weeklyMilestones: true,
  hydrationReminders: true,
  hydrationIntervalMinutes: 120,
  kickCountReminders: true,
  kickReminderTime: "19:00",
  partnerNotifications: false,
};

// ─── Push payload builder ───────────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  actions?: { action: string; title: string }[];
}

// ─── Daily tip ──────────────────────────────────────────────────────────────

/**
 * Build a push payload for the daily tip based on the current pregnancy week
 * and day of the week (0-6).
 */
export function buildDailyTipPayload(
  currentWeek: number,
  dayOfWeek: number
): PushPayload | null {
  const weekData = pregnancyData.find((w) => w.week === currentWeek);
  if (!weekData) return null;

  const tips = weekData.dailyTips;
  const tipIndex = dayOfWeek % tips.length;
  const tip = tips[tipIndex];

  return {
    title: `Conseil du jour - Semaine ${currentWeek}`,
    body: tip,
    tag: "daily-tip",
    url: "/",
    actions: [{ action: "open", title: "Voir plus" }],
  };
}

// ─── Appointment reminders ──────────────────────────────────────────────────

export interface AppointmentInfo {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string; // HH:mm
}

/**
 * Build a push payload for an upcoming appointment.
 * `advance` indicates which reminder window this is for.
 */
export function buildAppointmentReminderPayload(
  appointment: AppointmentInfo,
  advance: "2h" | "1d"
): PushPayload {
  const label = advance === "2h" ? "dans 2 heures" : "demain";
  return {
    title: `Rappel RDV ${label}`,
    body: `${appointment.title} - ${appointment.time}`,
    tag: `appointment-${appointment.id}-${advance}`,
    url: "/agenda",
    actions: [
      { action: "open", title: "Voir RDV" },
      { action: "dismiss", title: "OK" },
    ],
  };
}

/**
 * Given a list of appointments and the current time, return those that should
 * trigger a reminder right now (within a 5-minute window).
 */
export function getAppointmentsDueForReminder(
  appointments: AppointmentInfo[],
  now: Date,
  advance: "2h" | "1d"
): AppointmentInfo[] {
  const advanceMs = advance === "2h" ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const windowMs = 5 * 60 * 1000; // 5 minute check window

  return appointments.filter((apt) => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    const reminderTime = aptDate.getTime() - advanceMs;
    const diff = reminderTime - now.getTime();
    return diff >= 0 && diff < windowMs;
  });
}

// ─── Weekly milestone ───────────────────────────────────────────────────────

/**
 * Build a push payload for entering a new pregnancy week.
 */
export function buildWeeklyMilestonePayload(
  newWeek: number
): PushPayload | null {
  const weekData = pregnancyData.find((w) => w.week === newWeek);
  if (!weekData) return null;

  const milestone = weekData.weeklyMilestone || weekData.weeklyTip;
  return {
    title: `Semaine ${newWeek} ${weekData.fruitEmoji}`,
    body: `Votre bebe a la taille d'${weekData.fruit.toLowerCase()}. ${milestone}`,
    tag: "weekly-milestone",
    url: "/",
    actions: [{ action: "open", title: "Decouvrir" }],
  };
}

// ─── Hydration reminder ────────────────────────────────────────────────────

/**
 * Build a hydration reminder payload.
 */
export function buildHydrationReminderPayload(): PushPayload {
  const messages = [
    "N'oubliez pas de boire de l'eau. Votre corps et bebe en ont besoin !",
    "Un petit verre d'eau ? L'hydratation est essentielle pendant la grossesse.",
    "Pause hydratation ! Boire regulierement aide a prevenir les contractions precoces.",
    "Pensez a boire ! 1,5 a 2 litres d'eau par jour est l'objectif.",
  ];
  const body = messages[Math.floor(Math.random() * messages.length)];

  return {
    title: "Hydratation",
    body,
    tag: "hydration-reminder",
    url: "/tracking",
    actions: [
      { action: "log-water", title: "J'ai bu" },
      { action: "dismiss", title: "Plus tard" },
    ],
  };
}

/**
 * Returns true if a hydration reminder should fire right now, given the
 * user's configured interval and last reminder time.
 * Only fires between 8h and 22h.
 */
export function shouldSendHydrationReminder(
  now: Date,
  intervalMinutes: number,
  lastSentAt: Date | null
): boolean {
  const hour = now.getHours();
  if (hour < 8 || hour >= 22) return false;

  if (!lastSentAt) return true;

  const elapsed = now.getTime() - lastSentAt.getTime();
  return elapsed >= intervalMinutes * 60 * 1000;
}

// ─── Kick count reminder ───────────────────────────────────────────────────

/**
 * Build a kick count reminder payload. Typically sent once per evening.
 */
export function buildKickCountReminderPayload(): PushPayload {
  return {
    title: "Mouvements de bebe",
    body: "Avez-vous senti bebe bouger aujourd'hui ? Prenez un moment pour compter ses mouvements.",
    tag: "kick-reminder",
    url: "/tracking",
    actions: [
      { action: "start-count", title: "Commencer" },
      { action: "dismiss", title: "Deja fait" },
    ],
  };
}

// ─── Partner (duo mode) notifications ──────────────────────────────────────

/**
 * Build a partner notification payload for duo mode.
 */
export function buildPartnerNotificationPayload(
  type: "weekly-update" | "appointment" | "milestone",
  details: { week?: number; appointmentTitle?: string; milestone?: string }
): PushPayload {
  switch (type) {
    case "weekly-update": {
      const weekData = details.week
        ? pregnancyData.find((w) => w.week === details.week)
        : null;
      const partnerTip = weekData?.partnerTip || "";
      return {
        title: `Semaine ${details.week} - Conseil partenaire`,
        body: partnerTip,
        tag: "partner-weekly",
        url: "/",
        actions: [{ action: "open", title: "Lire" }],
      };
    }
    case "appointment":
      return {
        title: "RDV a venir",
        body: `N'oubliez pas le RDV : ${details.appointmentTitle}`,
        tag: "partner-appointment",
        url: "/agenda",
      };
    case "milestone":
      return {
        title: "Nouvelle etape !",
        body: details.milestone || "Un nouveau cap vient d'etre franchi.",
        tag: "partner-milestone",
        url: "/",
      };
  }
}

// ─── Scheduling helpers ─────────────────────────────────────────────────────

/**
 * Determine the current pregnancy week from a due date.
 */
export function getCurrentWeekFromDueDate(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const totalDays = 280; // 40 weeks
  const daysSinceLMP =
    totalDays - Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.max(1, Math.min(42, Math.ceil(daysSinceLMP / 7)));
  return week;
}

/**
 * Check if the user just entered a new week (i.e. today is the first day of a new week).
 */
export function isNewWeekDay(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  const totalDays = 280;
  const daysSinceLMP =
    totalDays - Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceLMP > 0 && daysSinceLMP % 7 === 0;
}
