"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { captureError } from "./monitoring";
import { useAuth } from "./auth";
import * as api from "./supabase-api";

// Re-export types
export type {
  WeightEntry,
  SymptomEntry,
  KickSession,
  ContractionEntry,
  ContractionSession,
  Appointment,
  WaterIntakeDay,
  ChecklistItem,
  ShoppingItem,
  Medication,
  MedicationLog,
  EmergencyContact,
  SleepEntry,
  MoodEntry,
  BloodPressureEntry,
  AbdomenMeasurement,
  ExerciseSession,
  BreathingSession,
  JournalNote,
  BumpPhoto,
} from "./supabase-api";

import type {
  WeightEntry,
  SymptomEntry,
  KickSession,
  ContractionSession,
  Appointment,
  WaterIntakeDay,
  ChecklistItem,
  ShoppingItem,
  Medication,
  MedicationLog,
  EmergencyContact,
  SleepEntry,
  MoodEntry,
  BloodPressureEntry,
  AbdomenMeasurement,
  ExerciseSession,
  BreathingSession,
  JournalNote,
  BumpPhoto,
} from "./supabase-api";

export type BirthPlanData = Record<string, unknown>;
export type NutritionChecks = Record<string, Record<string, boolean>>;

export type WeekMode = "SA" | "GA";

export interface StoreState {
  dueDate: string | null;
  mamaName: string | null;
  babyName: string | null;
  weekMode: WeekMode;
  weightEntries: WeightEntry[];
  symptomEntries: SymptomEntry[];
  kickSessions: KickSession[];
  contractionSessions: ContractionSession[];
  appointments: Appointment[];
  waterIntake: WaterIntakeDay;
  checklistItems: ChecklistItem[];
  babyNameFavorites: string[];
  shoppingItems: ShoppingItem[];
  shoppingBudget: number | null;
  medications: Medication[];
  medicationLogs: MedicationLog[];
  emergencyContacts: EmergencyContact[];
  birthPlan: BirthPlanData | null;
  nutritionChecks: NutritionChecks;
  sleepEntries: SleepEntry[];
  moodEntries: MoodEntry[];
  bloodPressureEntries: BloodPressureEntry[];
  abdomenMeasurements: AbdomenMeasurement[];
  exerciseSessions: ExerciseSession[];
  journalNotes: JournalNote[];
  bumpPhotos: BumpPhoto[];
  breathingSessions: BreathingSession[];
  loading: boolean;
  synced: boolean;
}

export interface StoreActions {
  setDueDate: (date: string) => Promise<void>;
  setProfile: (profile: { dueDate?: string; mamaName?: string; babyName?: string; weekMode?: WeekMode }) => Promise<void>;
  addWeightEntry: (entry: Omit<WeightEntry, "id">) => Promise<void>;
  removeWeightEntry: (id: string) => Promise<void>;
  addSymptomEntry: (entry: Omit<SymptomEntry, "id">) => Promise<void>;
  removeSymptomEntry: (id: string) => Promise<void>;
  addKickSession: (session: Omit<KickSession, "id">) => Promise<void>;
  removeKickSession: (id: string) => Promise<void>;
  addContractionSession: (session: Omit<ContractionSession, "id">) => Promise<void>;
  updateContractionSession: (id: string, session: Partial<ContractionSession>) => Promise<void>;
  removeContractionSession: (id: string) => Promise<void>;
  addAppointment: (appt: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, appt: Partial<Appointment>) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
  addWater: (date: string, ml: number) => Promise<void>;
  removeWater: (date: string, ml: number) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  addChecklistItem: (item: Omit<ChecklistItem, "id">) => Promise<void>;
  updateChecklistItem: (id: string, updates: Partial<Pick<ChecklistItem, "label" | "category">>) => Promise<void>;
  removeChecklistItem: (id: string) => Promise<void>;
  toggleBabyNameFavorite: (nom: string) => Promise<void>;
  setShoppingItems: (items: ShoppingItem[]) => Promise<void>;
  upsertShoppingItem: (item: ShoppingItem) => Promise<void>;
  removeShoppingItem: (id: string) => Promise<void>;
  setShoppingBudgetValue: (budget: number) => Promise<void>;
  addMedicationEntry: (med: Omit<Medication, "id">) => Promise<void>;
  removeMedicationEntry: (id: string) => Promise<void>;
  toggleMedicationTaken: (medId: string, date: string) => Promise<void>;
  addEmergencyContactEntry: (contact: Omit<EmergencyContact, "id">) => Promise<void>;
  updateEmergencyContactEntry: (id: string, contact: Partial<Omit<EmergencyContact, "id">>) => Promise<void>;
  removeEmergencyContactEntry: (id: string) => Promise<void>;
  saveBirthPlanData: (data: BirthPlanData) => Promise<void>;
  setNutritionChecksForDate: (date: string, checks: Record<string, boolean>) => Promise<void>;
  addSleepEntry: (entry: Omit<SleepEntry, "id" | "createdAt">) => Promise<void>;
  deleteSleepEntry: (id: string) => Promise<void>;
  addMoodEntry: (entry: Omit<MoodEntry, "id" | "createdAt">) => Promise<void>;
  deleteMoodEntry: (id: string) => Promise<void>;
  addBloodPressureEntry: (entry: Omit<BloodPressureEntry, "id" | "createdAt">) => Promise<void>;
  deleteBloodPressureEntry: (id: string) => Promise<void>;
  addAbdomenMeasurement: (entry: Omit<AbdomenMeasurement, "id" | "createdAt">) => Promise<void>;
  deleteAbdomenMeasurement: (id: string) => Promise<void>;
  addExerciseSession: (entry: Omit<ExerciseSession, "id" | "createdAt">) => Promise<void>;
  deleteExerciseSession: (id: string) => Promise<void>;
  addJournalNote: (note: Omit<JournalNote, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateJournalNoteEntry: (id: string, updates: Partial<Pick<JournalNote, "title" | "body" | "mood_emoji">>) => Promise<void>;
  deleteJournalNoteEntry: (id: string) => Promise<void>;
  refreshBumpPhotos: () => Promise<void>;
  addBreathingSession: (session: Omit<BreathingSession, "id" | "createdAt">) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, "id">[] = [
  // Administratif
  { category: "Administratif", label: "Déclarer la grossesse à l'Assurance Maladie", done: false, custom: false },
  { category: "Administratif", label: "Prévenir l'employeur avant 16 semaines", done: false, custom: false },
  { category: "Administratif", label: "Ouvrir les droits au congé maternité", done: false, custom: false },
  { category: "Administratif", label: "Préparer le dossier maternité", done: false, custom: false },
  // Médical
  { category: "Médical", label: "1ère consultation avant 10 semaines", done: false, custom: false },
  { category: "Médical", label: "Échographie 1er trimestre (11-13 SA)", done: false, custom: false },
  { category: "Médical", label: "Prise de sang 1er trimestre", done: false, custom: false },
  { category: "Médical", label: "Échographie 2ème trimestre (20-25 SA)", done: false, custom: false },
  { category: "Médical", label: "Test de dépistage diabète gestationnel", done: false, custom: false },
  { category: "Médical", label: "Échographie 3ème trimestre (32-34 SA)", done: false, custom: false },
  { category: "Médical", label: "Visiter la maternité", done: false, custom: false },
  { category: "Médical", label: "Cours de préparation à l'accouchement", done: false, custom: false },
  // Chambre bébé
  { category: "Chambre bébé", label: "Choisir et aménager la chambre", done: false, custom: false },
  { category: "Chambre bébé", label: "Acheter le lit/berceau", done: false, custom: false },
  { category: "Chambre bébé", label: "Acheter la poussette/siège auto", done: false, custom: false },
  { category: "Chambre bébé", label: "Préparer la layette", done: false, custom: false },
  { category: "Chambre bébé", label: "Choisir un pédiatre", done: false, custom: false },
  // Valise maternité
  { category: "Valise maternité", label: "Documents importants (carte vitale, carnet)", done: false, custom: false },
  { category: "Valise maternité", label: "Vêtements pour la maman", done: false, custom: false },
  { category: "Valise maternité", label: "Vêtements pour bébé (0-1 mois)", done: false, custom: false },
  { category: "Valise maternité", label: "Produits d'hygiène maman et bébé", done: false, custom: false },
  { category: "Valise maternité", label: "Coussin d'allaitement", done: false, custom: false },
];

const DEFAULT_CHECKLIST_ITEMS = DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `default-${i}` }));

const initialState: StoreState = {
  dueDate: null,
  mamaName: null,
  babyName: null,
  weekMode: "SA",
  weightEntries: [],
  symptomEntries: [],
  kickSessions: [],
  contractionSessions: [],
  appointments: [],
  waterIntake: {},
  checklistItems: DEFAULT_CHECKLIST_ITEMS,
  babyNameFavorites: [],
  shoppingItems: [],
  shoppingBudget: null,
  medications: [],
  medicationLogs: [],
  emergencyContacts: [],
  birthPlan: null,
  nutritionChecks: {},
  sleepEntries: [],
  moodEntries: [],
  bloodPressureEntries: [],
  abdomenMeasurements: [],
  exerciseSessions: [],
  journalNotes: [],
  bumpPhotos: [],
  breathingSessions: [],
  loading: true,
  synced: false,
};

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

// Helper to generate local ID (cryptographically secure)
function generateId(): string {
  return crypto.randomUUID();
}

// localStorage helpers for offline support
function loadFromStorage(): Partial<StoreState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("pregnancy-tracker");
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// Merge remote (authoritative) with local items not yet synced.
// Prevents silent data loss when a Supabase write failed but the
// item is still in localStorage — a legit concern on flaky connections
// or short-lived auth errors.
function mergeById<T extends { id: string }>(remote: T[], local: T[] | undefined): T[] {
  if (!local || local.length === 0) return remote;
  const remoteIds = new Set(remote.map((x) => x.id));
  const unsynced = local.filter((x) => !remoteIds.has(x.id));
  return [...remote, ...unsynced];
}

// Merge two string arrays (union). Used for baby_name_favorites where
// remote is authoritative but local may have unsynced adds.
function mergeStringSet(remote: string[], local: string[] | undefined): string[] {
  if (!local || local.length === 0) return remote;
  const set = new Set(remote);
  for (const s of local) set.add(s);
  return Array.from(set);
}

// Merge MedicationLogs by (medId, date) composite key.
function mergeMedLogs(remote: MedicationLog[], local: MedicationLog[] | undefined): MedicationLog[] {
  if (!local || local.length === 0) return remote;
  const key = (l: MedicationLog) => `${l.medId}|${l.date}`;
  const remoteKeys = new Set(remote.map(key));
  const unsynced = local.filter((x) => !remoteKeys.has(key(x)));
  return [...remote, ...unsynced];
}

// Merge NutritionChecks: remote date entries win, local dates not in remote preserved.
function mergeNutrition(remote: NutritionChecks, local: NutritionChecks | undefined): NutritionChecks {
  if (!local || Object.keys(local).length === 0) return remote;
  return { ...local, ...remote };
}

function saveToStorage(state: Partial<StoreState>) {
  if (typeof window === "undefined") return;
  try {
    const current = loadFromStorage();
    localStorage.setItem("pregnancy-tracker", JSON.stringify({ ...current, ...state }));
  } catch {
    // Ignore storage errors
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<StoreState>(initialState);
  const [mounted, setMounted] = useState(false);
  const loadingRef = useRef(false);

  // Load data from Supabase when user is available
  const loadData = useCallback(async () => {
    if (!user || loadingRef.current) return;
    
    loadingRef.current = true;
    setState(s => ({ ...s, loading: true }));

    try {
      // Fire Phase 1+2 (loadAllUserData) and Phase 3 (extra tables) in parallel.
      // No data dependency between them: ~24 queries fly together instead of 8 then 16.
      const todayDate = new Date().toISOString().slice(0, 10);
      const phase3Promise = Promise.all([
        api.getBabyNameFavorites(user.id).catch(() => [] as string[]),
        api.getShoppingItems(user.id).catch(() => [] as api.ShoppingItem[]),
        api.getShoppingBudget(user.id).catch(() => null),
        api.getMedications(user.id).catch(() => [] as api.Medication[]),
        api.getMedicationLogs(user.id).catch(() => [] as api.MedicationLog[]),
        api.getEmergencyContacts(user.id).catch(() => [] as api.EmergencyContact[]),
        api.getBirthPlan<BirthPlanData>(user.id).catch(() => null),
        api.getNutritionChecks(user.id, todayDate).catch(() => ({} as Record<string, boolean>)),
        api.getSleepEntries(user.id).catch(() => [] as SleepEntry[]),
        api.getMoodEntries(user.id).catch(() => [] as MoodEntry[]),
        api.getBloodPressureEntries(user.id).catch(() => [] as BloodPressureEntry[]),
        api.getAbdomenMeasurements(user.id).catch(() => [] as AbdomenMeasurement[]),
        api.getExerciseSessions(user.id).catch(() => [] as ExerciseSession[]),
        api.getJournalNotes(user.id).catch(() => [] as JournalNote[]),
        api.getBumpPhotos(user.id).catch(() => [] as BumpPhoto[]),
        api.getBreathingSessions(user.id).catch(() => [] as BreathingSession[]),
      ]);

      const data = await api.loadAllUserData(user.id);

      // Initialize checklist if empty
      if (data.checklistItems.length === 0) {
        // Check if we have local state to preserve (e.g. checked items)
        const localData = loadFromStorage();
        const localItems = localData.checklistItems ?? [];
        
        // Build defaults, merging done state from localStorage if IDs match
        const localMap = new Map(localItems.map(i => [i.id, i]));
        data.checklistItems = DEFAULT_CHECKLIST.map((item, i) => {
          const localItem = localMap.get(`default-${i}`);
          return { ...item, id: `default-${i}`, done: localItem?.done ?? false };
        });
        
        // Try to persist defaults to Supabase in background (non-blocking)
        api.initializeChecklist(user.id, DEFAULT_CHECKLIST).then(async (initialized) => {
          if (initialized) {
            const items = await api.getChecklistItems(user.id);
            if (items.length > 0) {
              setState(s => ({ ...s, checklistItems: items }));
              saveToStorage({ checklistItems: items });
            }
          }
        }).catch(() => {
          // Supabase init failed, defaults remain in state — no action needed
        });
      }

      const [
        babyNameFavorites,
        shoppingItems,
        shoppingBudget,
        medications,
        medicationLogs,
        emergencyContacts,
        birthPlan,
        todayNutrition,
        sleepEntries,
        moodEntries,
        bloodPressureEntries,
        abdomenMeasurements,
        exerciseSessions,
        journalNotes,
        bumpPhotos,
        breathingSessions,
      ] = await phase3Promise;

      // Merge remote + any local items that never reached Supabase.
      // Source of truth = remote, but we do not discard unsynced local items.
      const local = loadFromStorage();
      const mergedWater: WaterIntakeDay = { ...(local.waterIntake ?? {}), ...data.waterIntake };

      const merged = {
        dueDate: data.profile?.dueDate ?? local.dueDate ?? null,
        mamaName: data.profile?.mamaName ?? local.mamaName ?? null,
        babyName: data.profile?.babyName ?? local.babyName ?? null,
        weekMode: (data.profile?.weekMode ?? local.weekMode ?? "SA") as WeekMode,
        weightEntries: mergeById(data.weightEntries, local.weightEntries),
        symptomEntries: mergeById(data.symptomEntries, local.symptomEntries),
        kickSessions: mergeById(data.kickSessions, local.kickSessions),
        contractionSessions: mergeById(data.contractionSessions, local.contractionSessions),
        appointments: mergeById(data.appointments, local.appointments),
        waterIntake: mergedWater,
        checklistItems: mergeById(data.checklistItems, local.checklistItems),
        babyNameFavorites: mergeStringSet(babyNameFavorites, local.babyNameFavorites),
        shoppingItems: mergeById(shoppingItems, local.shoppingItems),
        shoppingBudget: shoppingBudget ?? local.shoppingBudget ?? null,
        medications: mergeById(medications, local.medications),
        medicationLogs: mergeMedLogs(medicationLogs, local.medicationLogs),
        emergencyContacts: mergeById(emergencyContacts, local.emergencyContacts),
        birthPlan: (birthPlan ?? local.birthPlan ?? null) as BirthPlanData | null,
        nutritionChecks: mergeNutrition(
          Object.keys(todayNutrition).length ? { [todayDate]: todayNutrition } : {},
          local.nutritionChecks,
        ),
        sleepEntries: mergeById(sleepEntries, local.sleepEntries),
        moodEntries: mergeById(moodEntries, local.moodEntries),
        bloodPressureEntries: mergeById(bloodPressureEntries, local.bloodPressureEntries),
        abdomenMeasurements: mergeById(abdomenMeasurements, local.abdomenMeasurements),
        exerciseSessions: mergeById(exerciseSessions, local.exerciseSessions),
        journalNotes: mergeById(journalNotes, local.journalNotes),
        bumpPhotos: mergeById(bumpPhotos, local.bumpPhotos),
        breathingSessions: mergeById(breathingSessions, local.breathingSessions),
      };

      setState({
        ...merged,
        loading: false,
        synced: true,
      });

      // Save merged state back to localStorage
      saveToStorage(merged);
    } catch (error) {
      captureError(error, { context: "loadFromSupabase" });
      // Fallback to localStorage
      const localData = loadFromStorage();
      setState(s => ({
        ...s,
        ...localData,
        checklistItems: localData.checklistItems?.length 
          ? localData.checklistItems 
          : DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `default-${i}` })),
        loading: false,
        synced: false,
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);

    // Load from localStorage first for immediate display
    const localData = loadFromStorage();
    if (Object.keys(localData).length > 0) {
      setState(s => ({
        ...s,
        ...localData,
        checklistItems: localData.checklistItems?.length
          ? localData.checklistItems
          : DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `default-${i}` })),
      }));
    } else {
      // Set default checklist
      setState(s => ({
        ...s,
        checklistItems: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `default-${i}` })),
      }));
    }
  }, []);

  // Load remote data ONLY when auth has resolved and a real user is present.
  // Critically, when auth is still resolving or user is absent, we DO NOT
  // touch state (leaves localStorage cache intact). This prevents the race
  // "auth flickers → load runs with user=null → remote fetches fail silently
  // → empty state overwrites localStorage".
  useEffect(() => {
    if (!mounted) return;
    if (authLoading) return;
    if (user) {
      loadData();
    } else {
      // Signed-out: stop the loading spinner but do NOT wipe local state.
      setState(s => ({ ...s, loading: false }));
    }
  }, [mounted, authLoading, user, loadData]);

  // ============== ACTIONS ==============

  const setDueDate = useCallback(async (date: string) => {
    let previousDate: string | null = null;
    setState(s => {
      previousDate = s.dueDate;
      return { ...s, dueDate: date };
    });
    saveToStorage({ dueDate: date });

    if (user) {
      try {
        await api.upsertProfile(user.id, { dueDate: date });
      } catch (err) {
        setState(s => ({ ...s, dueDate: previousDate }));
        saveToStorage({ dueDate: previousDate ?? undefined });
        throw err;
      }
    }
  }, [user]);

  const setProfile = useCallback(async (profile: { dueDate?: string; mamaName?: string; babyName?: string; weekMode?: WeekMode }) => {
    type ProfileSnapshot = { dueDate: string | null; mamaName: string | null; babyName: string | null; weekMode: WeekMode };
    let previous: ProfileSnapshot | null = null;
    setState(s => {
      previous = { dueDate: s.dueDate, mamaName: s.mamaName, babyName: s.babyName, weekMode: s.weekMode } as ProfileSnapshot;
      return {
        ...s,
        dueDate: profile.dueDate ?? s.dueDate,
        mamaName: profile.mamaName ?? s.mamaName,
        babyName: profile.babyName ?? s.babyName,
        weekMode: profile.weekMode ?? s.weekMode,
      };
    });
    saveToStorage(profile);

    if (user) {
      try {
        await api.upsertProfile(user.id, profile);
      } catch (err) {
        const prev = previous as ProfileSnapshot | null;
        if (prev) {
          setState(s => ({ ...s, dueDate: prev.dueDate, mamaName: prev.mamaName, babyName: prev.babyName, weekMode: prev.weekMode }));
          saveToStorage({
            dueDate: prev.dueDate ?? undefined,
            mamaName: prev.mamaName ?? undefined,
            babyName: prev.babyName ?? undefined,
            weekMode: prev.weekMode,
          });
        }
        throw err;
      }
    }
  }, [user]);

  const addWeightEntry = useCallback(async (entry: Omit<WeightEntry, "id">) => {
    const tempId = generateId();
    const newEntry = { ...entry, id: tempId };

    setState(s => ({
      ...s,
      weightEntries: [...s.weightEntries, newEntry],
    }));

    if (user) {
      try {
        const result = await api.addWeightEntry(user.id, entry);
        if (result) {
          setState(s => ({
            ...s,
            weightEntries: s.weightEntries.map(e => e.id === tempId ? result : e),
          }));
        } else {
          throw new Error("Enregistrement impossible (réponse vide)");
        }
      } catch (err) {
        setState(s => ({
          ...s,
          weightEntries: s.weightEntries.filter(e => e.id !== tempId),
        }));
        captureError(err, { context: "addWeightEntry", entry });
        throw err;
      }
    }

    setState(s => {
      saveToStorage({ weightEntries: s.weightEntries });
      return s;
    });
  }, [user]);

  const removeWeightEntry = useCallback(async (id: string) => {
    let removed: WeightEntry | undefined;
    setState(s => {
      removed = s.weightEntries.find(e => e.id === id);
      const next = s.weightEntries.filter(e => e.id !== id);
      saveToStorage({ weightEntries: next });
      return { ...s, weightEntries: next };
    });
    if (user) {
      try {
        await api.deleteWeightEntry(id);
      } catch (err) {
        captureError(err, { context: "removeWeightEntry" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.weightEntries, item];
            saveToStorage({ weightEntries: restored });
            return { ...s, weightEntries: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  const addSymptomEntry = useCallback(async (entry: Omit<SymptomEntry, "id">) => {
    const tempId = generateId();
    const newEntry = { ...entry, id: tempId };
    
    setState(s => ({
      ...s,
      symptomEntries: [...s.symptomEntries, newEntry],
    }));
    
    if (user) {
      const result = await api.addSymptomEntry(user.id, entry);
      if (result) {
        setState(s => ({
          ...s,
          symptomEntries: s.symptomEntries.map(e => e.id === tempId ? result : e),
        }));
      }
    }
    
    setState(s => {
      saveToStorage({ symptomEntries: s.symptomEntries });
      return s;
    });
  }, [user]);

  const removeSymptomEntry = useCallback(async (id: string) => {
    let removed: SymptomEntry | undefined;
    setState(s => {
      removed = s.symptomEntries.find(e => e.id === id);
      const next = s.symptomEntries.filter(e => e.id !== id);
      saveToStorage({ symptomEntries: next });
      return { ...s, symptomEntries: next };
    });
    if (user) {
      try {
        await api.deleteSymptomEntry(id);
      } catch (err) {
        captureError(err, { context: "removeSymptomEntry" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.symptomEntries, item];
            saveToStorage({ symptomEntries: restored });
            return { ...s, symptomEntries: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  const addKickSession = useCallback(async (session: Omit<KickSession, "id">) => {
    const tempId = generateId();
    const newSession = { ...session, id: tempId };
    
    setState(s => ({
      ...s,
      kickSessions: [...s.kickSessions, newSession],
    }));
    
    if (user) {
      const result = await api.addKickSession(user.id, session);
      if (result) {
        setState(s => ({
          ...s,
          kickSessions: s.kickSessions.map(k => k.id === tempId ? result : k),
        }));
      }
    }
    
    setState(s => {
      saveToStorage({ kickSessions: s.kickSessions });
      return s;
    });
  }, [user]);

  const removeKickSession = useCallback(async (id: string) => {
    let removed: KickSession | undefined;
    setState(s => {
      removed = s.kickSessions.find(k => k.id === id);
      const next = s.kickSessions.filter(k => k.id !== id);
      saveToStorage({ kickSessions: next });
      return { ...s, kickSessions: next };
    });
    if (user) {
      try {
        await api.deleteKickSession(id);
      } catch (err) {
        captureError(err, { context: "removeKickSession" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.kickSessions, item];
            saveToStorage({ kickSessions: restored });
            return { ...s, kickSessions: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  const addContractionSession = useCallback(async (session: Omit<ContractionSession, "id">) => {
    const tempId = generateId();
    const newSession = { ...session, id: tempId };
    
    setState(s => ({
      ...s,
      contractionSessions: [...s.contractionSessions, newSession],
    }));
    
    if (user) {
      const result = await api.addContractionSession(user.id, session);
      if (result) {
        setState(s => ({
          ...s,
          contractionSessions: s.contractionSessions.map(c => c.id === tempId ? result : c),
        }));
      }
    }
    
    setState(s => {
      saveToStorage({ contractionSessions: s.contractionSessions });
      return s;
    });
  }, [user]);

  const updateContractionSession = useCallback(async (id: string, update: Partial<ContractionSession>) => {
    setState(s => ({
      ...s,
      contractionSessions: s.contractionSessions.map(c =>
        c.id === id ? { ...c, ...update } : c
      ),
    }));
    
    if (user) {
      await api.updateContractionSession(id, update);
    }
    
    setState(s => {
      saveToStorage({ contractionSessions: s.contractionSessions });
      return s;
    });
  }, [user]);

  const removeContractionSession = useCallback(async (id: string) => {
    let removed: ContractionSession | undefined;
    setState(s => {
      removed = s.contractionSessions.find(c => c.id === id);
      const next = s.contractionSessions.filter(c => c.id !== id);
      saveToStorage({ contractionSessions: next });
      return { ...s, contractionSessions: next };
    });
    if (user) {
      try {
        await api.deleteContractionSession(id);
      } catch (err) {
        captureError(err, { context: "removeContractionSession" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.contractionSessions, item];
            saveToStorage({ contractionSessions: restored });
            return { ...s, contractionSessions: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  const addAppointment = useCallback(async (appt: Omit<Appointment, "id">) => {
    const tempId = generateId();
    const newAppt = { ...appt, id: tempId };
    
    setState(s => ({
      ...s,
      appointments: [...s.appointments, newAppt].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));
    
    if (user) {
      const result = await api.addAppointment(user.id, appt);
      if (result) {
        setState(s => ({
          ...s,
          appointments: s.appointments.map(a => a.id === tempId ? result : a),
        }));
        // Fire-and-forget: notify opted-in duo partners. Ignored if user has none.
        fetch("/api/partner-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "appointment",
            details: { appointmentTitle: result.title },
          }),
        }).catch(() => {});
      }
    }

    setState(s => {
      saveToStorage({ appointments: s.appointments });
      return s;
    });
  }, [user]);

  const updateAppointment = useCallback(async (id: string, update: Partial<Appointment>) => {
    setState(s => ({
      ...s,
      appointments: s.appointments.map(a => (a.id === id ? { ...a, ...update } : a)),
    }));
    
    if (user) {
      await api.updateAppointment(id, update);
    }
    
    setState(s => {
      saveToStorage({ appointments: s.appointments });
      return s;
    });
  }, [user]);

  const removeAppointment = useCallback(async (id: string) => {
    let removed: Appointment | undefined;
    setState(s => {
      removed = s.appointments.find(a => a.id === id);
      const next = s.appointments.filter(a => a.id !== id);
      saveToStorage({ appointments: next });
      return { ...s, appointments: next };
    });
    if (user) {
      try {
        await api.deleteAppointment(id);
      } catch (err) {
        captureError(err, { context: "removeAppointment" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.appointments, item].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            saveToStorage({ appointments: restored });
            return { ...s, appointments: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  const addWater = useCallback(async (date: string, ml: number) => {
    let newTotal = 0;
    setState(s => {
      newTotal = (s.waterIntake[date] ?? 0) + ml;
      return {
        ...s,
        waterIntake: { ...s.waterIntake, [date]: newTotal },
      };
    });

    // We need a brief tick to let state settle before reading newTotal
    await Promise.resolve();

    if (user) {
      await api.upsertWaterIntake(user.id, date, newTotal);
    }

    setState(s => {
      saveToStorage({ waterIntake: s.waterIntake });
      return s;
    });
  }, [user]);

  const removeWater = useCallback(async (date: string, ml: number) => {
    let newTotal = 0;
    setState(s => {
      newTotal = Math.max(0, (s.waterIntake[date] ?? 0) - ml);
      return {
        ...s,
        waterIntake: { ...s.waterIntake, [date]: newTotal },
      };
    });

    await Promise.resolve();

    if (user) {
      await api.upsertWaterIntake(user.id, date, newTotal);
    }

    setState(s => {
      saveToStorage({ waterIntake: s.waterIntake });
      return s;
    });
  }, [user]);

  const toggleChecklistItem = useCallback(async (id: string) => {
    const item = state.checklistItems.find(i => i.id === id);
    if (!item) return;
    
    const newDone = !item.done;
    
    setState(s => ({
      ...s,
      checklistItems: s.checklistItems.map(i =>
        i.id === id ? { ...i, done: newDone } : i
      ),
    }));
    
    if (user) {
      await api.toggleChecklistItem(id, newDone);
    }
    
    setState(s => {
      saveToStorage({ checklistItems: s.checklistItems });
      return s;
    });
  }, [user, state.checklistItems]);

  const addChecklistItem = useCallback(async (item: Omit<ChecklistItem, "id">) => {
    const tempId = generateId();
    const newItem = { ...item, id: tempId };
    
    setState(s => ({
      ...s,
      checklistItems: [...s.checklistItems, newItem],
    }));
    
    if (user) {
      const result = await api.addChecklistItem(user.id, item);
      if (result) {
        setState(s => ({
          ...s,
          checklistItems: s.checklistItems.map(c => c.id === tempId ? result : c),
        }));
      }
    }
    
    setState(s => {
      saveToStorage({ checklistItems: s.checklistItems });
      return s;
    });
  }, [user]);

  const updateChecklistItem = useCallback(
    async (id: string, updates: Partial<Pick<ChecklistItem, "label" | "category">>) => {
      let previous: ChecklistItem | undefined;
      setState(s => {
        previous = s.checklistItems.find(c => c.id === id);
        if (!previous) return s;
        const next = s.checklistItems.map(c => (c.id === id ? { ...c, ...updates } : c));
        saveToStorage({ checklistItems: next });
        return { ...s, checklistItems: next };
      });
      if (user) {
        try {
          await api.updateChecklistItem(id, updates);
        } catch (err) {
          captureError(err, { context: "updateChecklistItem" });
          const prev = previous;
          if (prev) {
            setState(s => {
              const restored = s.checklistItems.map(c => (c.id === id ? prev : c));
              saveToStorage({ checklistItems: restored });
              return { ...s, checklistItems: restored };
            });
          }
          throw err;
        }
      }
    },
    [user]
  );

  const removeChecklistItem = useCallback(async (id: string) => {
    let removed: ChecklistItem | undefined;
    setState(s => {
      removed = s.checklistItems.find(c => c.id === id);
      const next = s.checklistItems.filter(c => c.id !== id);
      saveToStorage({ checklistItems: next });
      return { ...s, checklistItems: next };
    });
    if (user) {
      try {
        await api.deleteChecklistItem(id);
      } catch (err) {
        captureError(err, { context: "removeChecklistItem" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.checklistItems, item];
            saveToStorage({ checklistItems: restored });
            return { ...s, checklistItems: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  // ============== BABY NAME FAVORITES ==============

  const toggleBabyNameFavorite = useCallback(async (nom: string) => {
    let willAdd = false;
    setState(s => {
      const has = s.babyNameFavorites.includes(nom);
      willAdd = !has;
      const next = has
        ? s.babyNameFavorites.filter(n => n !== nom)
        : [...s.babyNameFavorites, nom];
      saveToStorage({ babyNameFavorites: next });
      return { ...s, babyNameFavorites: next };
    });

    if (user) {
      if (willAdd) await api.addBabyNameFavorite(user.id, nom);
      else await api.removeBabyNameFavorite(user.id, nom);
    }
  }, [user]);

  // ============== SHOPPING ==============

  const setShoppingItems = useCallback(async (items: ShoppingItem[]) => {
    setState(s => ({ ...s, shoppingItems: items }));
    saveToStorage({ shoppingItems: items });
    if (user) {
      await api.bulkInsertShoppingItems(user.id, items);
    }
  }, [user]);

  const upsertShoppingItem = useCallback(async (item: ShoppingItem) => {
    setState(s => {
      const exists = s.shoppingItems.some(i => i.id === item.id);
      const next = exists
        ? s.shoppingItems.map(i => (i.id === item.id ? item : i))
        : [...s.shoppingItems, item];
      saveToStorage({ shoppingItems: next });
      return { ...s, shoppingItems: next };
    });
    if (user) {
      await api.upsertShoppingItem(user.id, item);
    }
  }, [user]);

  const removeShoppingItem = useCallback(async (id: string) => {
    setState(s => {
      const next = s.shoppingItems.filter(i => i.id !== id);
      saveToStorage({ shoppingItems: next });
      return { ...s, shoppingItems: next };
    });
    if (user) {
      await api.deleteShoppingItem(user.id, id);
    }
  }, [user]);

  const setShoppingBudgetValue = useCallback(async (budget: number) => {
    setState(s => ({ ...s, shoppingBudget: budget }));
    saveToStorage({ shoppingBudget: budget });
    if (user) {
      await api.setShoppingBudget(user.id, budget);
    }
  }, [user]);

  // ============== MEDICATIONS ==============

  const addMedicationEntry = useCallback(async (med: Omit<Medication, "id">) => {
    const tempId = generateId();
    const newMed: Medication = { ...med, id: tempId };
    setState(s => {
      const next = [...s.medications, newMed];
      saveToStorage({ medications: next });
      return { ...s, medications: next };
    });

    if (user) {
      const result = await api.addMedication(user.id, med);
      if (result) {
        setState(s => {
          const next = s.medications.map(m => (m.id === tempId ? result : m));
          saveToStorage({ medications: next });
          return { ...s, medications: next };
        });
      }
    }
  }, [user]);

  const removeMedicationEntry = useCallback(async (id: string) => {
    let removedMed: Medication | undefined;
    let removedLogs: MedicationLog[] = [];
    setState(s => {
      removedMed = s.medications.find(m => m.id === id);
      removedLogs = s.medicationLogs.filter(l => l.medId === id);
      const next = s.medications.filter(m => m.id !== id);
      const nextLogs = s.medicationLogs.filter(l => l.medId !== id);
      saveToStorage({ medications: next, medicationLogs: nextLogs });
      return { ...s, medications: next, medicationLogs: nextLogs };
    });
    if (user) {
      try {
        await api.deleteMedication(id);
      } catch (err) {
        captureError(err, { context: "removeMedicationEntry" });
        const med = removedMed;
        const logs = removedLogs;
        if (med) {
          setState(s => {
            const restoredMeds = [...s.medications, med];
            const restoredLogs = [...s.medicationLogs, ...logs];
            saveToStorage({ medications: restoredMeds, medicationLogs: restoredLogs });
            return { ...s, medications: restoredMeds, medicationLogs: restoredLogs };
          });
        }
        throw err;
      }
    }
  }, [user]);

  const toggleMedicationTaken = useCallback(async (medId: string, date: string) => {
    let willTake = false;
    setState(s => {
      const existing = s.medicationLogs.find(l => l.medId === medId && l.date === date);
      willTake = !existing;
      const next = existing
        ? s.medicationLogs.filter(l => !(l.medId === medId && l.date === date))
        : [...s.medicationLogs, { medId, date, taken: true }];
      saveToStorage({ medicationLogs: next });
      return { ...s, medicationLogs: next };
    });

    if (user) {
      if (willTake) await api.upsertMedicationLog(user.id, medId, date, true);
      else await api.deleteMedicationLog(user.id, medId, date);
    }
  }, [user]);

  // ============== EMERGENCY CONTACTS ==============

  const addEmergencyContactEntry = useCallback(async (contact: Omit<EmergencyContact, "id">) => {
    const tempId = generateId();
    const newContact: EmergencyContact = { ...contact, id: tempId };
    setState(s => {
      const next = [...s.emergencyContacts, newContact];
      saveToStorage({ emergencyContacts: next });
      return { ...s, emergencyContacts: next };
    });

    if (user) {
      const result = await api.addEmergencyContact(user.id, contact);
      if (result) {
        setState(s => {
          const next = s.emergencyContacts.map(c => (c.id === tempId ? result : c));
          saveToStorage({ emergencyContacts: next });
          return { ...s, emergencyContacts: next };
        });
      }
    }
  }, [user]);

  const updateEmergencyContactEntry = useCallback(async (id: string, update: Partial<Omit<EmergencyContact, "id">>) => {
    setState(s => {
      const next = s.emergencyContacts.map(c => (c.id === id ? { ...c, ...update } : c));
      saveToStorage({ emergencyContacts: next });
      return { ...s, emergencyContacts: next };
    });
    if (user) {
      await api.updateEmergencyContact(id, update);
    }
  }, [user]);

  const removeEmergencyContactEntry = useCallback(async (id: string) => {
    let removed: EmergencyContact | undefined;
    setState(s => {
      removed = s.emergencyContacts.find(c => c.id === id);
      const next = s.emergencyContacts.filter(c => c.id !== id);
      saveToStorage({ emergencyContacts: next });
      return { ...s, emergencyContacts: next };
    });
    if (user) {
      try {
        await api.deleteEmergencyContact(id);
      } catch (err) {
        captureError(err, { context: "removeEmergencyContactEntry" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [...s.emergencyContacts, item];
            saveToStorage({ emergencyContacts: restored });
            return { ...s, emergencyContacts: restored };
          });
        }
        throw err;
      }
    }
  }, [user]);

  // ============== BIRTH PLAN ==============

  const saveBirthPlanData = useCallback(async (data: BirthPlanData) => {
    setState(s => ({ ...s, birthPlan: data }));
    saveToStorage({ birthPlan: data });
    if (user) {
      await api.saveBirthPlan(user.id, data);
    }
  }, [user]);

  // ============== NUTRITION CHECKS ==============

  const setNutritionChecksForDate = useCallback(async (date: string, checks: Record<string, boolean>) => {
    setState(s => {
      const next = { ...s.nutritionChecks, [date]: checks };
      saveToStorage({ nutritionChecks: next });
      return { ...s, nutritionChecks: next };
    });
    if (user) {
      await api.saveNutritionChecks(user.id, date, checks);
    }
  }, [user]);

  // ============== SLEEP ==============

  const addSleepEntry = useCallback(async (entry: Omit<SleepEntry, "id" | "createdAt">) => {
    const tempId = generateId();
    const optimistic: SleepEntry = { ...entry, id: tempId };
    setState(s => {
      const next = [optimistic, ...s.sleepEntries];
      saveToStorage({ sleepEntries: next });
      return { ...s, sleepEntries: next };
    });
    if (user) {
      try {
        const result = await api.addSleepEntry(user.id, entry);
        if (result) {
          setState(s => {
            const next = s.sleepEntries.map(e => (e.id === tempId ? result : e));
            saveToStorage({ sleepEntries: next });
            return { ...s, sleepEntries: next };
          });
        }
      } catch (error) {
        captureError(error, { context: "addSleepEntry" });
      }
    }
  }, [user]);

  const deleteSleepEntry = useCallback(async (id: string) => {
    let removed: SleepEntry | undefined;
    setState(s => {
      removed = s.sleepEntries.find(e => e.id === id);
      const next = s.sleepEntries.filter(e => e.id !== id);
      saveToStorage({ sleepEntries: next });
      return { ...s, sleepEntries: next };
    });
    if (user) {
      try {
        await api.deleteSleepEntry(id);
      } catch (error) {
        captureError(error, { context: "deleteSleepEntry" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [item, ...s.sleepEntries];
            saveToStorage({ sleepEntries: restored });
            return { ...s, sleepEntries: restored };
          });
        }
        throw error;
      }
    }
  }, [user]);

  // ============== MOOD ==============

  const addMoodEntry = useCallback(async (entry: Omit<MoodEntry, "id" | "createdAt">) => {
    const tempId = generateId();
    const optimistic: MoodEntry = { ...entry, id: tempId };
    setState(s => {
      const filtered = s.moodEntries.filter(e => e.date !== entry.date);
      const next = [optimistic, ...filtered];
      saveToStorage({ moodEntries: next });
      return { ...s, moodEntries: next };
    });
    if (user) {
      try {
        const result = await api.addMoodEntry(user.id, entry);
        if (result) {
          setState(s => {
            const next = s.moodEntries.map(e => (e.id === tempId ? result : e));
            saveToStorage({ moodEntries: next });
            return { ...s, moodEntries: next };
          });
        }
      } catch (error) {
        captureError(error, { context: "addMoodEntry" });
      }
    }
  }, [user]);

  const deleteMoodEntry = useCallback(async (id: string) => {
    let removed: MoodEntry | undefined;
    setState(s => {
      removed = s.moodEntries.find(e => e.id === id);
      const next = s.moodEntries.filter(e => e.id !== id);
      saveToStorage({ moodEntries: next });
      return { ...s, moodEntries: next };
    });
    if (user) {
      try {
        await api.deleteMoodEntry(id);
      } catch (error) {
        captureError(error, { context: "deleteMoodEntry" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [item, ...s.moodEntries];
            saveToStorage({ moodEntries: restored });
            return { ...s, moodEntries: restored };
          });
        }
        throw error;
      }
    }
  }, [user]);

  // ============== BLOOD PRESSURE ==============

  const addBloodPressureEntry = useCallback(async (entry: Omit<BloodPressureEntry, "id" | "createdAt">) => {
    const tempId = generateId();
    const optimistic: BloodPressureEntry = { ...entry, id: tempId };
    setState(s => {
      const next = [optimistic, ...s.bloodPressureEntries];
      saveToStorage({ bloodPressureEntries: next });
      return { ...s, bloodPressureEntries: next };
    });
    if (user) {
      try {
        const result = await api.addBloodPressureEntry(user.id, entry);
        if (result) {
          setState(s => {
            const next = s.bloodPressureEntries.map(e => (e.id === tempId ? result : e));
            saveToStorage({ bloodPressureEntries: next });
            return { ...s, bloodPressureEntries: next };
          });
        }
      } catch (error) {
        captureError(error, { context: "addBloodPressureEntry" });
      }
    }
  }, [user]);

  const deleteBloodPressureEntry = useCallback(async (id: string) => {
    let removed: BloodPressureEntry | undefined;
    setState(s => {
      removed = s.bloodPressureEntries.find(e => e.id === id);
      const next = s.bloodPressureEntries.filter(e => e.id !== id);
      saveToStorage({ bloodPressureEntries: next });
      return { ...s, bloodPressureEntries: next };
    });
    if (user) {
      try {
        await api.deleteBloodPressureEntry(id);
      } catch (error) {
        captureError(error, { context: "deleteBloodPressureEntry" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [item, ...s.bloodPressureEntries];
            saveToStorage({ bloodPressureEntries: restored });
            return { ...s, bloodPressureEntries: restored };
          });
        }
        throw error;
      }
    }
  }, [user]);

  // ============== ABDOMEN ==============

  const addAbdomenMeasurement = useCallback(async (entry: Omit<AbdomenMeasurement, "id" | "createdAt">) => {
    const tempId = generateId();
    const optimistic: AbdomenMeasurement = { ...entry, id: tempId };
    setState(s => {
      const next = [optimistic, ...s.abdomenMeasurements];
      saveToStorage({ abdomenMeasurements: next });
      return { ...s, abdomenMeasurements: next };
    });
    if (user) {
      try {
        const result = await api.addAbdomenMeasurement(user.id, entry);
        if (result) {
          setState(s => {
            const next = s.abdomenMeasurements.map(e => (e.id === tempId ? result : e));
            saveToStorage({ abdomenMeasurements: next });
            return { ...s, abdomenMeasurements: next };
          });
        }
      } catch (error) {
        captureError(error, { context: "addAbdomenMeasurement" });
      }
    }
  }, [user]);

  const deleteAbdomenMeasurement = useCallback(async (id: string) => {
    let removed: AbdomenMeasurement | undefined;
    setState(s => {
      removed = s.abdomenMeasurements.find(e => e.id === id);
      const next = s.abdomenMeasurements.filter(e => e.id !== id);
      saveToStorage({ abdomenMeasurements: next });
      return { ...s, abdomenMeasurements: next };
    });
    if (user) {
      try {
        await api.deleteAbdomenMeasurement(id);
      } catch (error) {
        captureError(error, { context: "deleteAbdomenMeasurement" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [item, ...s.abdomenMeasurements];
            saveToStorage({ abdomenMeasurements: restored });
            return { ...s, abdomenMeasurements: restored };
          });
        }
        throw error;
      }
    }
  }, [user]);

  // ============== EXERCISE ==============

  const addExerciseSession = useCallback(async (entry: Omit<ExerciseSession, "id" | "createdAt">) => {
    const tempId = generateId();
    const optimistic: ExerciseSession = { ...entry, id: tempId };
    setState(s => {
      const next = [optimistic, ...s.exerciseSessions];
      saveToStorage({ exerciseSessions: next });
      return { ...s, exerciseSessions: next };
    });
    if (user) {
      try {
        const result = await api.addExerciseSession(user.id, entry);
        if (result) {
          setState(s => {
            const next = s.exerciseSessions.map(e => (e.id === tempId ? result : e));
            saveToStorage({ exerciseSessions: next });
            return { ...s, exerciseSessions: next };
          });
        }
      } catch (error) {
        captureError(error, { context: "addExerciseSession" });
      }
    }
  }, [user]);

  const deleteExerciseSession = useCallback(async (id: string) => {
    let removed: ExerciseSession | undefined;
    setState(s => {
      removed = s.exerciseSessions.find(e => e.id === id);
      const next = s.exerciseSessions.filter(e => e.id !== id);
      saveToStorage({ exerciseSessions: next });
      return { ...s, exerciseSessions: next };
    });
    if (user) {
      try {
        await api.deleteExerciseSession(id);
      } catch (error) {
        captureError(error, { context: "deleteExerciseSession" });
        const item = removed;
        if (item) {
          setState(s => {
            const restored = [item, ...s.exerciseSessions];
            saveToStorage({ exerciseSessions: restored });
            return { ...s, exerciseSessions: restored };
          });
        }
        throw error;
      }
    }
  }, [user]);

  // ============== JOURNAL NOTES ==============

  const addJournalNote = useCallback(async (note: Omit<JournalNote, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    try {
      const result = await api.createJournalNote(user.id, note);
      if (result) {
        setState(s => {
          const next = [result, ...s.journalNotes];
          saveToStorage({ journalNotes: next });
          return { ...s, journalNotes: next };
        });
      }
    } catch (error) {
      captureError(error, { context: "addJournalNote" });
    }
  }, [user]);

  const updateJournalNoteEntry = useCallback(async (id: string, updates: Partial<Pick<JournalNote, "title" | "body" | "mood_emoji">>) => {
    if (!user) return;
    setState(s => {
      const next = s.journalNotes.map(n => (n.id === id ? { ...n, ...updates } : n));
      saveToStorage({ journalNotes: next });
      return { ...s, journalNotes: next };
    });
    try {
      await api.updateJournalNote(id, user.id, updates);
    } catch (error) {
      captureError(error, { context: "updateJournalNote" });
    }
  }, [user]);

  const deleteJournalNoteEntry = useCallback(async (id: string) => {
    if (!user) return;
    setState(s => {
      const next = s.journalNotes.filter(n => n.id !== id);
      saveToStorage({ journalNotes: next });
      return { ...s, journalNotes: next };
    });
    try {
      await api.deleteJournalNote(id, user.id);
    } catch (error) {
      captureError(error, { context: "deleteJournalNote" });
    }
  }, [user]);

  // ============== BUMP PHOTOS ==============

  const refreshBumpPhotos = useCallback(async () => {
    if (!user) return;
    try {
      const photos = await api.getBumpPhotos(user.id);
      setState(s => ({ ...s, bumpPhotos: photos }));
      saveToStorage({ bumpPhotos: photos });
    } catch (error) {
      captureError(error, { context: "refreshBumpPhotos" });
    }
  }, [user]);

  // ============== BREATHING SESSIONS ==============

  const addBreathingSession = useCallback(async (session: Omit<BreathingSession, "id" | "createdAt">) => {
    const tempId = generateId();
    const optimistic: BreathingSession = { ...session, id: tempId };
    setState(s => {
      const next = [optimistic, ...s.breathingSessions];
      saveToStorage({ breathingSessions: next });
      return { ...s, breathingSessions: next };
    });
    if (user) {
      try {
        const result = await api.addBreathingSession(user.id, session);
        if (result) {
          setState(s => {
            const next = s.breathingSessions.map(b => (b.id === tempId ? result : b));
            saveToStorage({ breathingSessions: next });
            return { ...s, breathingSessions: next };
          });
        }
      } catch (error) {
        captureError(error, { context: "addBreathingSession" });
      }
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const value: StoreState & StoreActions = {
    ...state,
    setDueDate,
    setProfile,
    addWeightEntry,
    removeWeightEntry,
    addSymptomEntry,
    removeSymptomEntry,
    addKickSession,
    removeKickSession,
    addContractionSession,
    updateContractionSession,
    removeContractionSession,
    addAppointment,
    updateAppointment,
    removeAppointment,
    addWater,
    removeWater,
    toggleChecklistItem,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    toggleBabyNameFavorite,
    setShoppingItems,
    upsertShoppingItem,
    removeShoppingItem,
    setShoppingBudgetValue,
    addMedicationEntry,
    removeMedicationEntry,
    toggleMedicationTaken,
    addEmergencyContactEntry,
    updateEmergencyContactEntry,
    removeEmergencyContactEntry,
    saveBirthPlanData,
    setNutritionChecksForDate,
    addSleepEntry,
    deleteSleepEntry,
    addMoodEntry,
    deleteMoodEntry,
    addBloodPressureEntry,
    deleteBloodPressureEntry,
    addAbdomenMeasurement,
    deleteAbdomenMeasurement,
    addExerciseSession,
    deleteExerciseSession,
    addJournalNote,
    updateJournalNoteEntry,
    deleteJournalNoteEntry,
    refreshBumpPhotos,
    addBreathingSession,
    refreshData,
  };

  return React.createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
