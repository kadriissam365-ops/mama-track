/**
 * API Supabase pour MamaTrack
 * Toutes les fonctions CRUD pour interagir avec la base de données
 */

import { createClient } from './supabase';
import { validateWeight, validateNote, validateName, assertValid } from './validation';

// Re-export all shared types from the central types file
export type {
  WeightEntry,
  SymptomEntry,
  KickSession,
  ContractionEntry,
  ContractionSession,
  Appointment,
  WaterIntakeDay,
  ChecklistItem,
  Profile,
  NotificationSettingsData,
} from './types';

import type {
  WeightEntry,
  SymptomEntry,
  KickSession,
  ContractionSession,
  ContractionEntry,
  Appointment,
  WaterIntakeDay,
  ChecklistItem,
  Profile,
  NotificationSettingsData,
} from './types';

// Helper function to get supabase client with any type to avoid type conflicts
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient() as any;
}

// ============== PROFILE ==============

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    dueDate: data.due_date,
    babyName: data.baby_name,
    mamaName: data.mama_name,
  };
}

export async function upsertProfile(userId: string, profile: Partial<Omit<Profile, 'id'>>): Promise<boolean> {
  // Validation
  if (profile.babyName !== undefined) assertValid(validateName(profile.babyName));
  if (profile.mamaName !== undefined) assertValid(validateName(profile.mamaName));

  const supabase = getSupabase();
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      due_date: profile.dueDate,
      baby_name: profile.babyName,
      mama_name: profile.mamaName,
    });
  
  return !error;
}

// ============== WEIGHT ENTRIES ==============

export async function getWeightEntries(userId: string): Promise<WeightEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((e: any) => ({
    id: e.id,
    date: e.date,
    weight: e.weight,
    note: e.note ?? undefined,
  }));
}

export async function addWeightEntry(userId: string, entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry | null> {
  // Validation
  assertValid(validateWeight(entry.weight));
  if (entry.note) assertValid(validateNote(entry.note));

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('weight_entries')
    .insert({
      user_id: userId,
      date: entry.date,
      weight: entry.weight,
      note: entry.note ?? null,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    date: data.date,
    weight: data.weight,
    note: data.note ?? undefined,
  };
}

export async function deleteWeightEntry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============== SYMPTOM ENTRIES ==============

export async function getSymptomEntries(userId: string): Promise<SymptomEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((e: any) => ({
    id: e.id,
    date: e.date,
    symptoms: (e.symptoms as string[]) ?? [],
    severity: e.severity,
    note: e.note ?? undefined,
  }));
}

export async function addSymptomEntry(userId: string, entry: Omit<SymptomEntry, 'id'>): Promise<SymptomEntry | null> {
  // Validation
  if (entry.note) assertValid(validateNote(entry.note));

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('symptom_entries')
    .insert({
      user_id: userId,
      date: entry.date,
      symptoms: entry.symptoms,
      severity: entry.severity,
      note: entry.note ?? null,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    date: data.date,
    symptoms: (data.symptoms as string[]) ?? [],
    severity: data.severity,
    note: data.note ?? undefined,
  };
}

export async function deleteSymptomEntry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('symptom_entries')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============== KICK SESSIONS ==============

export async function getKickSessions(userId: string): Promise<KickSession[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('kick_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((k: any) => ({
    id: k.id,
    date: k.date,
    startTime: k.start_time,
    count: k.count,
    duration: k.duration,
  }));
}

export async function addKickSession(userId: string, session: Omit<KickSession, 'id'>): Promise<KickSession | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('kick_sessions')
    .insert({
      user_id: userId,
      date: session.date,
      start_time: session.startTime,
      count: session.count,
      duration: session.duration,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    date: data.date,
    startTime: data.start_time,
    count: data.count,
    duration: data.duration,
  };
}

export async function deleteKickSession(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('kick_sessions')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============== CONTRACTION SESSIONS ==============

export async function getContractionSessions(userId: string): Promise<ContractionSession[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('contraction_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((c: any) => ({
    id: c.id,
    date: c.date,
    contractions: (c.contractions as ContractionEntry[]) ?? [],
  }));
}

export async function addContractionSession(userId: string, session: Omit<ContractionSession, 'id'>): Promise<ContractionSession | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('contraction_sessions')
    .insert({
      user_id: userId,
      date: session.date,
      contractions: session.contractions,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    date: data.date,
    contractions: (data.contractions as ContractionEntry[]) ?? [],
  };
}

export async function updateContractionSession(id: string, update: Partial<ContractionSession>): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('contraction_sessions')
    .update({
      contractions: update.contractions,
    })
    .eq('id', id);
  
  return !error;
}

export async function deleteContractionSession(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('contraction_sessions')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============== APPOINTMENTS ==============

export async function getAppointments(userId: string): Promise<Appointment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((a: any) => ({
    id: a.id,
    date: a.date,
    time: a.time,
    title: a.title,
    doctor: a.doctor ?? undefined,
    location: a.location ?? undefined,
    notes: a.notes ?? undefined,
    done: a.done,
  }));
}

export async function addAppointment(userId: string, appt: Omit<Appointment, 'id'>): Promise<Appointment | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: userId,
      date: appt.date,
      time: appt.time,
      title: appt.title,
      doctor: appt.doctor ?? null,
      location: appt.location ?? null,
      notes: appt.notes ?? null,
      done: appt.done,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    date: data.date,
    time: data.time,
    title: data.title,
    doctor: data.doctor ?? undefined,
    location: data.location ?? undefined,
    notes: data.notes ?? undefined,
    done: data.done,
  };
}

export async function updateAppointment(id: string, update: Partial<Appointment>): Promise<boolean> {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};
  if (update.date !== undefined) updateData.date = update.date;
  if (update.time !== undefined) updateData.time = update.time;
  if (update.title !== undefined) updateData.title = update.title;
  if (update.doctor !== undefined) updateData.doctor = update.doctor;
  if (update.location !== undefined) updateData.location = update.location;
  if (update.notes !== undefined) updateData.notes = update.notes;
  if (update.done !== undefined) updateData.done = update.done;
  
  const { error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id);
  
  return !error;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============== WATER INTAKE ==============

export async function getWaterIntake(userId: string): Promise<WaterIntakeDay> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return {};
  
  const result: WaterIntakeDay = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((w: any) => {
    result[w.date] = w.ml;
  });
  return result;
}

export async function upsertWaterIntake(userId: string, date: string, ml: number): Promise<boolean> {
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('water_intake')
    .upsert(
      { user_id: userId, date, ml },
      { onConflict: 'user_id,date' }
    );
  
  return !error;
}

// ============== CHECKLIST ITEMS ==============

export async function getChecklistItems(userId: string): Promise<ChecklistItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((c: any) => ({
    id: c.id,
    category: c.category,
    label: c.label,
    done: c.done,
    custom: c.custom,
  }));
}

export async function initializeChecklist(userId: string, items: Omit<ChecklistItem, 'id'>[]): Promise<boolean> {
  const supabase = getSupabase();
  
  // Check if user already has checklist items
  const { data: existing } = await supabase
    .from('checklist_items')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  if (existing && existing.length > 0) {
    return true; // Already initialized
  }
  
  const { error } = await supabase
    .from('checklist_items')
    .insert(items.map(item => ({
      user_id: userId,
      category: item.category,
      label: item.label,
      done: item.done,
      custom: item.custom,
    })));
  
  if (error) {
    console.error('[MamaTrack] initializeChecklist error:', error.code, error.message, error.details);
  }
  
  return !error;
}

export async function addChecklistItem(userId: string, item: Omit<ChecklistItem, 'id'>): Promise<ChecklistItem | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('checklist_items')
    .insert({
      user_id: userId,
      category: item.category,
      label: item.label,
      done: item.done,
      custom: item.custom,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    category: data.category,
    label: data.label,
    done: data.done,
    custom: data.custom,
  };
}

export async function toggleChecklistItem(id: string, done: boolean): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('checklist_items')
    .update({ done })
    .eq('id', id);
  
  return !error;
}

export async function deleteChecklistItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', id);
  
  return !error;
}

// ============== NOTIFICATION SETTINGS ==============

// NotificationSettingsData is imported from './types' above

const NOTIFICATION_SETTINGS_KEY = 'mamatrack-notifications';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsData = {
  waterReminders: true,
  medicationMorning: false,
  medicationEvening: false,
  appointmentReminders: true,
  reminderIntervalHours: 2,
};

export async function getNotificationSettings(userId: string): Promise<NotificationSettingsData> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      const settings: NotificationSettingsData = {
        waterReminders: data.water_reminders ?? DEFAULT_NOTIFICATION_SETTINGS.waterReminders,
        medicationMorning: data.medication_morning ?? DEFAULT_NOTIFICATION_SETTINGS.medicationMorning,
        medicationEvening: data.medication_evening ?? DEFAULT_NOTIFICATION_SETTINGS.medicationEvening,
        appointmentReminders: data.appointment_reminders ?? DEFAULT_NOTIFICATION_SETTINGS.appointmentReminders,
        reminderIntervalHours: data.reminder_interval_hours ?? DEFAULT_NOTIFICATION_SETTINGS.reminderIntervalHours,
      };
      // Sync to localStorage as cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      }
      return settings;
    }
  } catch {
    // Supabase table may not exist yet, fallback to localStorage
  }
  
  // Fallback: read from localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore
    }
  }
  
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettingsData>
): Promise<NotificationSettingsData> {
  const supabase = getSupabase();
  
  // Get current settings first
  const current = await getNotificationSettings(userId);
  const updated = { ...current, ...settings };
  
  // Always persist to localStorage for offline/fast access
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  }
  
  // Persist to Supabase notification_settings table
  try {
    await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        water_reminders: updated.waterReminders,
        medication_morning: updated.medicationMorning,
        medication_evening: updated.medicationEvening,
        appointment_reminders: updated.appointmentReminders,
        reminder_interval_hours: updated.reminderIntervalHours,
      }, { onConflict: 'user_id' });
  } catch {
    // Silent fail - localStorage is the source of truth if Supabase fails
  }
  
  return updated;
}

// ============== LOAD ALL DATA ==============

export interface AllUserData {
  profile: Profile | null;
  weightEntries: WeightEntry[];
  symptomEntries: SymptomEntry[];
  kickSessions: KickSession[];
  contractionSessions: ContractionSession[];
  appointments: Appointment[];
  waterIntake: WaterIntakeDay;
  checklistItems: ChecklistItem[];
}

export async function loadAllUserData(userId: string): Promise<AllUserData> {
  // Phase 1 : données critiques
  const [profile, weightEntries, appointments] = await Promise.all([
    getProfile(userId),
    getWeightEntries(userId),
    getAppointments(userId),
  ]);

  // Phase 2 : données secondaires (légèrement différées)
  await new Promise(r => setTimeout(r, 100));
  const [symptomEntries, kickSessions, contractionSessions, waterIntake, checklistItems] = await Promise.all([
    getSymptomEntries(userId),
    getKickSessions(userId),
    getContractionSessions(userId),
    getWaterIntake(userId),
    getChecklistItems(userId),
  ]);

  return {
    profile,
    weightEntries,
    appointments,
    symptomEntries,
    kickSessions,
    contractionSessions,
    waterIntake,
    checklistItems,
  };
}
