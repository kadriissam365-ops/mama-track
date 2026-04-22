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

  const wm = (data as { week_mode?: string }).week_mode;
  return {
    id: data.id,
    dueDate: data.due_date,
    babyName: data.baby_name,
    mamaName: data.mama_name,
    weekMode: wm === "GA" ? "GA" : "SA",
  };
}

export async function upsertProfile(userId: string, profile: Partial<Omit<Profile, 'id'>>): Promise<boolean> {
  // Validation
  if (profile.babyName !== undefined) assertValid(validateName(profile.babyName));
  if (profile.mamaName !== undefined) assertValid(validateName(profile.mamaName));

  const supabase = getSupabase();
  const payload: Record<string, unknown> = { id: userId };
  if (profile.dueDate !== undefined) payload.due_date = profile.dueDate;
  if (profile.babyName !== undefined) payload.baby_name = profile.babyName;
  if (profile.mamaName !== undefined) payload.mama_name = profile.mamaName;
  if (profile.weekMode !== undefined) payload.week_mode = profile.weekMode;

  const { error } = await supabase.from('profiles').upsert(payload);

  if (error) {
    console.error('[upsertProfile] Supabase error:', error.message, error.details, error.hint);
    throw new Error(error.message || "Échec de l'enregistrement du profil");
  }
  return true;
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

  if (error) {
    console.error('[addWeightEntry] Supabase error:', error.message, error.details, error.hint);
    throw new Error(error.message || 'Échec de l\'enregistrement du poids');
  }
  if (!data) return null;
  
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

// ============== BUMP PHOTOS ==============

export interface BumpPhoto {
  id: string;
  user_id: string;
  week: number;
  storage_path: string;
  note?: string | null;
  captured_at: string;
  created_at: string;
  signedUrl?: string;
}

export interface JournalNote {
  id: string;
  user_id: string;
  week: number;
  title?: string | null;
  body: string;
  mood_emoji?: string | null;
  created_at: string;
}

export async function getBumpPhotos(userId: string): Promise<BumpPhoto[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bump_photos')
    .select('*')
    .eq('user_id', userId)
    .order('week', { ascending: true });

  if (error || !data) return [];
  return data as BumpPhoto[];
}

export async function getBumpPhotoSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('bump-photos')
    .createSignedUrl(storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function upsertBumpPhoto(
  userId: string,
  week: number,
  file: Blob,
  note?: string
): Promise<BumpPhoto | null> {
  const supabase = getSupabase();
  const storagePath = `${userId}/week-${week}.jpg`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('bump-photos')
    .upload(storagePath, file, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return null;
  }

  // Upsert to DB
  const { data, error } = await supabase
    .from('bump_photos')
    .upsert({
      user_id: userId,
      week,
      storage_path: storagePath,
      note: note || null,
      captured_at: new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id,week' })
    .select()
    .single();

  if (error || !data) return null;
  return data as BumpPhoto;
}

export async function updateBumpPhotoNote(
  userId: string,
  week: number,
  note: string
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('bump_photos')
    .update({ note })
    .eq('user_id', userId)
    .eq('week', week);
  return !error;
}

export async function deleteBumpPhoto(userId: string, week: number, storagePath: string): Promise<boolean> {
  const supabase = getSupabase();

  // Delete from storage
  await supabase.storage.from('bump-photos').remove([storagePath]);

  // Delete from DB
  const { error } = await supabase
    .from('bump_photos')
    .delete()
    .eq('user_id', userId)
    .eq('week', week);

  return !error;
}

// ============== JOURNAL NOTES ==============

export async function getJournalNotes(userId: string): Promise<JournalNote[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('journal_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as JournalNote[];
}

export async function createJournalNote(
  userId: string,
  note: Omit<JournalNote, 'id' | 'user_id' | 'created_at'>
): Promise<JournalNote | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('journal_notes')
    .insert({
      user_id: userId,
      week: note.week,
      title: note.title || null,
      body: note.body,
      mood_emoji: note.mood_emoji || null,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as JournalNote;
}

export async function updateJournalNote(
  noteId: string,
  userId: string,
  updates: Partial<Pick<JournalNote, 'title' | 'body' | 'mood_emoji'>>
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('journal_notes')
    .update(updates)
    .eq('id', noteId)
    .eq('user_id', userId);
  return !error;
}

export async function deleteJournalNote(noteId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('journal_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);
  return !error;
}

// ============== BABY NAME FAVORITES ==============

export async function getBabyNameFavorites(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('baby_name_favorites')
    .select('nom')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => r.nom as string);
}

export async function addBabyNameFavorite(userId: string, nom: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('baby_name_favorites')
    .upsert({ user_id: userId, nom }, { onConflict: 'user_id,nom' });
  return !error;
}

export async function removeBabyNameFavorite(userId: string, nom: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('baby_name_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('nom', nom);
  return !error;
}

// ============== SHOPPING LIST ==============

export interface ShoppingItem {
  id: string;
  categorie: string;
  nom: string;
  quantite: number;
  priorite: 'Essentiel' | 'Pratique' | 'Bonus';
  budgetEstime: number;
  coche: boolean;
  custom: boolean;
}

export async function getShoppingItems(userId: string): Promise<ShoppingItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    categorie: r.categorie,
    nom: r.nom,
    quantite: r.quantite,
    priorite: r.priorite as ShoppingItem['priorite'],
    budgetEstime: Number(r.budget_estime),
    coche: r.coche,
    custom: r.custom,
  }));
}

export async function upsertShoppingItem(userId: string, item: ShoppingItem): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopping_items')
    .upsert({
      id: item.id,
      user_id: userId,
      categorie: item.categorie,
      nom: item.nom,
      quantite: item.quantite,
      priorite: item.priorite,
      budget_estime: item.budgetEstime,
      coche: item.coche,
      custom: item.custom,
    }, { onConflict: 'id' });
  return !error;
}

export async function deleteShoppingItem(userId: string, id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  return !error;
}

export async function bulkInsertShoppingItems(userId: string, items: ShoppingItem[]): Promise<boolean> {
  if (items.length === 0) return true;
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopping_items')
    .upsert(items.map((item) => ({
      id: item.id,
      user_id: userId,
      categorie: item.categorie,
      nom: item.nom,
      quantite: item.quantite,
      priorite: item.priorite,
      budget_estime: item.budgetEstime,
      coche: item.coche,
      custom: item.custom,
    })), { onConflict: 'id' });
  return !error;
}

export async function getShoppingBudget(userId: string): Promise<number | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('shopping_budget')
    .select('budget')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Number((data as any).budget);
}

export async function setShoppingBudget(userId: string, budget: number): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('shopping_budget')
    .upsert({ user_id: userId, budget, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return !error;
}

// ============== MEDICATIONS ==============

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes: string;
  color: string;
  active: boolean;
}

export interface MedicationLog {
  medId: string;
  date: string;
  taken: boolean;
}

export async function getMedications(userId: string): Promise<Medication[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    dosage: r.dosage ?? '',
    frequency: r.frequency ?? '1x',
    time: r.time ?? '08:00',
    notes: r.notes ?? '',
    color: r.color ?? '',
    active: r.active ?? true,
  }));
}

export async function addMedication(userId: string, med: Omit<Medication, 'id'>): Promise<Medication | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('medications')
    .insert({
      user_id: userId,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      time: med.time,
      notes: med.notes || null,
      color: med.color,
      active: med.active,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    dosage: data.dosage ?? '',
    frequency: data.frequency ?? '1x',
    time: data.time ?? '08:00',
    notes: data.notes ?? '',
    color: data.color ?? '',
    active: data.active ?? true,
  };
}

export async function deleteMedication(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('medications').delete().eq('id', id);
  return !error;
}

export async function getMedicationLogs(userId: string): Promise<MedicationLog[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('medication_logs')
    .select('med_id, date, taken')
    .eq('user_id', userId);
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    medId: r.med_id,
    date: r.date,
    taken: r.taken,
  }));
}

export async function upsertMedicationLog(
  userId: string,
  medId: string,
  date: string,
  taken: boolean
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('medication_logs')
    .upsert({ user_id: userId, med_id: medId, date, taken }, { onConflict: 'user_id,med_id,date' });
  return !error;
}

export async function deleteMedicationLog(userId: string, medId: string, date: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('medication_logs')
    .delete()
    .eq('user_id', userId)
    .eq('med_id', medId)
    .eq('date', date);
  return !error;
}

// ============== EMERGENCY CONTACTS ==============

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  emoji: string;
}

export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    role: r.role ?? 'Autre',
    emoji: r.emoji ?? '📞',
  }));
}

export async function addEmergencyContact(
  userId: string,
  contact: Omit<EmergencyContact, 'id'>
): Promise<EmergencyContact | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      user_id: userId,
      name: contact.name,
      phone: contact.phone,
      role: contact.role,
      emoji: contact.emoji,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    role: data.role ?? 'Autre',
    emoji: data.emoji ?? '📞',
  };
}

export async function updateEmergencyContact(
  id: string,
  contact: Partial<Omit<EmergencyContact, 'id'>>
): Promise<boolean> {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};
  if (contact.name !== undefined) updateData.name = contact.name;
  if (contact.phone !== undefined) updateData.phone = contact.phone;
  if (contact.role !== undefined) updateData.role = contact.role;
  if (contact.emoji !== undefined) updateData.emoji = contact.emoji;
  const { error } = await supabase
    .from('emergency_contacts')
    .update(updateData)
    .eq('id', id);
  return !error;
}

export async function deleteEmergencyContact(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
  return !error;
}

// ============== BIRTH PLAN ==============

export async function getBirthPlan<T>(userId: string): Promise<T | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('birth_plan')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any).data ?? null) as T | null;
}

export async function saveBirthPlan<T>(userId: string, data: T): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('birth_plan')
    .upsert(
      { user_id: userId, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  return !error;
}

// ============== DAILY NUTRITION ==============

export async function getNutritionChecks(
  userId: string,
  date: string
): Promise<Record<string, boolean>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nutrition_checks')
    .select('checks')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error || !data) return {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any).checks ?? {}) as Record<string, boolean>;
}

export async function saveNutritionChecks(
  userId: string,
  date: string,
  checks: Record<string, boolean>
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('nutrition_checks')
    .upsert(
      { user_id: userId, date, checks, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );
  return !error;
}

// ============== SLEEP ENTRIES ==============

export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: number;
  note?: string;
  createdAt?: string;
}

export async function getSleepEntries(userId: string): Promise<SleepEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    date: r.date,
    hours: Number(r.hours),
    quality: r.quality,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function addSleepEntry(
  userId: string,
  entry: Omit<SleepEntry, 'id' | 'createdAt'>
): Promise<SleepEntry | null> {
  if (entry.note) assertValid(validateNote(entry.note));
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sleep_entries')
    .insert({
      user_id: userId,
      date: entry.date,
      hours: entry.hours,
      quality: entry.quality,
      note: entry.note ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    hours: Number(data.hours),
    quality: data.quality,
    note: data.note ?? undefined,
    createdAt: data.created_at,
  };
}

export async function deleteSleepEntry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('sleep_entries').delete().eq('id', id);
  return !error;
}

// ============== MOOD ENTRIES ==============

export interface MoodEntry {
  id: string;
  date: string;
  moodEmoji: string;
  moodLabel: string;
  note?: string;
  createdAt?: string;
}

export async function getMoodEntries(userId: string): Promise<MoodEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    date: r.date,
    moodEmoji: r.mood_emoji,
    moodLabel: r.mood_label,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function getPartnerMoodEntries(partnerUserId: string): Promise<MoodEntry[]> {
  return getMoodEntries(partnerUserId);
}

export async function addMoodEntry(
  userId: string,
  entry: Omit<MoodEntry, 'id' | 'createdAt'>
): Promise<MoodEntry | null> {
  if (entry.note) assertValid(validateNote(entry.note));
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mood_entries')
    .upsert(
      {
        user_id: userId,
        date: entry.date,
        mood_emoji: entry.moodEmoji,
        mood_label: entry.moodLabel,
        note: entry.note ?? null,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    moodEmoji: data.mood_emoji,
    moodLabel: data.mood_label,
    note: data.note ?? undefined,
    createdAt: data.created_at,
  };
}

export async function deleteMoodEntry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('mood_entries').delete().eq('id', id);
  return !error;
}

// ============== BLOOD PRESSURE ENTRIES ==============

export interface BloodPressureEntry {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  note?: string;
  createdAt?: string;
}

export async function getBloodPressureEntries(userId: string): Promise<BloodPressureEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blood_pressure_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    date: r.date,
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse ?? undefined,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function addBloodPressureEntry(
  userId: string,
  entry: Omit<BloodPressureEntry, 'id' | 'createdAt'>
): Promise<BloodPressureEntry | null> {
  if (entry.note) assertValid(validateNote(entry.note));
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blood_pressure_entries')
    .insert({
      user_id: userId,
      date: entry.date,
      systolic: entry.systolic,
      diastolic: entry.diastolic,
      pulse: entry.pulse ?? null,
      note: entry.note ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    systolic: data.systolic,
    diastolic: data.diastolic,
    pulse: data.pulse ?? undefined,
    note: data.note ?? undefined,
    createdAt: data.created_at,
  };
}

export async function deleteBloodPressureEntry(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('blood_pressure_entries').delete().eq('id', id);
  return !error;
}

// ============== ABDOMEN MEASUREMENTS ==============

export interface AbdomenMeasurement {
  id: string;
  date: string;
  circumferenceCm: number;
  note?: string;
  createdAt?: string;
}

export async function getAbdomenMeasurements(userId: string): Promise<AbdomenMeasurement[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('abdomen_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    date: r.date,
    circumferenceCm: Number(r.circumference_cm),
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function addAbdomenMeasurement(
  userId: string,
  entry: Omit<AbdomenMeasurement, 'id' | 'createdAt'>
): Promise<AbdomenMeasurement | null> {
  if (entry.note) assertValid(validateNote(entry.note));
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('abdomen_measurements')
    .insert({
      user_id: userId,
      date: entry.date,
      circumference_cm: entry.circumferenceCm,
      note: entry.note ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    circumferenceCm: Number(data.circumference_cm),
    note: data.note ?? undefined,
    createdAt: data.created_at,
  };
}

export async function deleteAbdomenMeasurement(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('abdomen_measurements').delete().eq('id', id);
  return !error;
}

// ============== EXERCISE SESSIONS ==============

export interface ExerciseSession {
  id: string;
  date: string;
  activity: string;
  durationMin: number;
  intensity: string;
  note?: string;
  createdAt?: string;
}

export async function getExerciseSessions(userId: string): Promise<ExerciseSession[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('exercise_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    date: r.date,
    activity: r.activity,
    durationMin: r.duration_min,
    intensity: r.intensity,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function addExerciseSession(
  userId: string,
  entry: Omit<ExerciseSession, 'id' | 'createdAt'>
): Promise<ExerciseSession | null> {
  if (entry.note) assertValid(validateNote(entry.note));
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('exercise_sessions')
    .insert({
      user_id: userId,
      date: entry.date,
      activity: entry.activity,
      duration_min: entry.durationMin,
      intensity: entry.intensity,
      note: entry.note ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    activity: data.activity,
    durationMin: data.duration_min,
    intensity: data.intensity,
    note: data.note ?? undefined,
    createdAt: data.created_at,
  };
}

export async function deleteExerciseSession(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('exercise_sessions').delete().eq('id', id);
  return !error;
}

// ============== BREATHING SESSIONS ==============

export interface BreathingSession {
  id: string;
  startedAt: string;
  durationSec: number;
  pattern: string;
  rounds: number;
  completed: boolean;
  createdAt?: string;
}

export async function getBreathingSessions(userId: string): Promise<BreathingSession[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('breathing_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    startedAt: r.started_at,
    durationSec: r.duration_sec,
    pattern: r.pattern,
    rounds: r.rounds,
    completed: r.completed,
    createdAt: r.created_at,
  }));
}

export async function addBreathingSession(
  userId: string,
  session: Omit<BreathingSession, 'id' | 'createdAt'>
): Promise<BreathingSession | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('breathing_sessions')
    .insert({
      user_id: userId,
      started_at: session.startedAt,
      duration_sec: session.durationSec,
      pattern: session.pattern,
      rounds: session.rounds,
      completed: session.completed,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    startedAt: data.started_at,
    durationSec: data.duration_sec,
    pattern: data.pattern,
    rounds: data.rounds,
    completed: data.completed,
    createdAt: data.created_at,
  };
}

export async function deleteBreathingSession(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('breathing_sessions').delete().eq('id', id);
  return !error;
}
