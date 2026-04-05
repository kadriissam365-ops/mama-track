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
} from "./supabase-api";

import type {
  WeightEntry,
  SymptomEntry,
  KickSession,
  ContractionSession,
  Appointment,
  WaterIntakeDay,
  ChecklistItem,
} from "./supabase-api";

export interface StoreState {
  dueDate: string | null;
  mamaName: string | null;
  babyName: string | null;
  weightEntries: WeightEntry[];
  symptomEntries: SymptomEntry[];
  kickSessions: KickSession[];
  contractionSessions: ContractionSession[];
  appointments: Appointment[];
  waterIntake: WaterIntakeDay;
  checklistItems: ChecklistItem[];
  loading: boolean;
  synced: boolean;
}

export interface StoreActions {
  setDueDate: (date: string) => Promise<void>;
  setProfile: (profile: { dueDate?: string; mamaName?: string; babyName?: string }) => Promise<void>;
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
  removeChecklistItem: (id: string) => Promise<void>;
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
  weightEntries: [],
  symptomEntries: [],
  kickSessions: [],
  contractionSessions: [],
  appointments: [],
  waterIntake: {},
  checklistItems: DEFAULT_CHECKLIST_ITEMS,
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

      setState({
        dueDate: data.profile?.dueDate ?? null,
        mamaName: data.profile?.mamaName ?? null,
        babyName: data.profile?.babyName ?? null,
        weightEntries: data.weightEntries,
        symptomEntries: data.symptomEntries,
        kickSessions: data.kickSessions,
        contractionSessions: data.contractionSessions,
        appointments: data.appointments,
        waterIntake: data.waterIntake,
        checklistItems: data.checklistItems,
        loading: false,
        synced: true,
      });

      // Save to localStorage as backup
      saveToStorage({
        dueDate: data.profile?.dueDate ?? null,
        mamaName: data.profile?.mamaName ?? null,
        babyName: data.profile?.babyName ?? null,
        weightEntries: data.weightEntries,
        symptomEntries: data.symptomEntries,
        kickSessions: data.kickSessions,
        contractionSessions: data.contractionSessions,
        appointments: data.appointments,
        waterIntake: data.waterIntake,
        checklistItems: data.checklistItems,
      });
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

  useEffect(() => {
    if (mounted && !authLoading && user) {
      loadData();
    } else if (mounted && !authLoading && !user) {
      setState(s => ({ ...s, loading: false }));
    }
  }, [mounted, authLoading, user, loadData]);

  // ============== ACTIONS ==============

  const setDueDate = useCallback(async (date: string) => {
    setState(s => ({ ...s, dueDate: date }));
    saveToStorage({ dueDate: date });
    
    if (user) {
      await api.upsertProfile(user.id, { dueDate: date });
    }
  }, [user]);

  const setProfile = useCallback(async (profile: { dueDate?: string; mamaName?: string; babyName?: string }) => {
    setState(s => ({
      ...s,
      dueDate: profile.dueDate ?? s.dueDate,
      mamaName: profile.mamaName ?? s.mamaName,
      babyName: profile.babyName ?? s.babyName,
    }));
    saveToStorage(profile);
    
    if (user) {
      await api.upsertProfile(user.id, profile);
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
      const result = await api.addWeightEntry(user.id, entry);
      if (result) {
        setState(s => ({
          ...s,
          weightEntries: s.weightEntries.map(e => e.id === tempId ? result : e),
        }));
      }
    }
    
    setState(s => {
      saveToStorage({ weightEntries: s.weightEntries });
      return s;
    });
  }, [user]);

  const removeWeightEntry = useCallback(async (id: string) => {
    setState(s => ({
      ...s,
      weightEntries: s.weightEntries.filter(e => e.id !== id),
    }));
    
    if (user) {
      await api.deleteWeightEntry(id);
    }
    
    setState(s => {
      saveToStorage({ weightEntries: s.weightEntries });
      return s;
    });
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
    setState(s => ({
      ...s,
      symptomEntries: s.symptomEntries.filter(e => e.id !== id),
    }));
    
    if (user) {
      await api.deleteSymptomEntry(id);
    }
    
    setState(s => {
      saveToStorage({ symptomEntries: s.symptomEntries });
      return s;
    });
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
    setState(s => ({
      ...s,
      kickSessions: s.kickSessions.filter(k => k.id !== id),
    }));
    
    if (user) {
      await api.deleteKickSession(id);
    }
    
    setState(s => {
      saveToStorage({ kickSessions: s.kickSessions });
      return s;
    });
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
    setState(s => ({
      ...s,
      contractionSessions: s.contractionSessions.filter(c => c.id !== id),
    }));
    
    if (user) {
      await api.deleteContractionSession(id);
    }
    
    setState(s => {
      saveToStorage({ contractionSessions: s.contractionSessions });
      return s;
    });
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
    setState(s => ({
      ...s,
      appointments: s.appointments.filter(a => a.id !== id),
    }));
    
    if (user) {
      await api.deleteAppointment(id);
    }
    
    setState(s => {
      saveToStorage({ appointments: s.appointments });
      return s;
    });
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

  const removeChecklistItem = useCallback(async (id: string) => {
    setState(s => ({
      ...s,
      checklistItems: s.checklistItems.filter(c => c.id !== id),
    }));
    
    if (user) {
      await api.deleteChecklistItem(id);
    }
    
    setState(s => {
      saveToStorage({ checklistItems: s.checklistItems });
      return s;
    });
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
    removeChecklistItem,
    refreshData,
  };

  return React.createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
