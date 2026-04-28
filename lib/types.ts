/**
 * Types partagés pour MamaTrack
 * Source unique de vérité pour tous les types de l'application
 */

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  note?: string;
}

export interface SymptomEntry {
  id: string;
  date: string;
  symptoms: string[];
  severity: number;
  note?: string;
}

export interface KickSession {
  id: string;
  date: string;
  startTime: string;
  count: number;
  duration: number;
}

export interface ContractionEntry {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  interval?: number;
}

export interface ContractionSession {
  id: string;
  date: string;
  contractions: ContractionEntry[];
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  doctor?: string;
  location?: string;
  notes?: string;
  done: boolean;
}

export interface WaterIntakeDay {
  [date: string]: number;
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  done: boolean;
  custom: boolean;
}

export type WeekMode = "SA" | "GA";

export interface Profile {
  id: string;
  dueDate: string | null;
  babyName: string | null;
  mamaName: string | null;
  weekMode: WeekMode;
  isPremium: boolean;
  premiumUntil: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface NotificationSettingsData {
  waterReminders: boolean;
  medicationMorning: boolean;
  medicationEvening: boolean;
  appointmentReminders: boolean;
  reminderIntervalHours: number;
}
