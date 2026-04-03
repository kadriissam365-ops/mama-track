"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

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
  severity: number; // 1-5
  note?: string;
}

export interface KickSession {
  id: string;
  date: string;
  startTime: string;
  count: number;
  duration: number; // minutes
}

export interface ContractionEntry {
  id: string;
  startTime: number; // timestamp
  endTime?: number;
  duration?: number; // seconds
  interval?: number; // seconds depuis la dernière contraction
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
  [date: string]: number; // ml
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  done: boolean;
  custom: boolean;
}

export interface StoreState {
  dueDate: string | null;
  weightEntries: WeightEntry[];
  symptomEntries: SymptomEntry[];
  kickSessions: KickSession[];
  contractionSessions: ContractionSession[];
  appointments: Appointment[];
  waterIntake: WaterIntakeDay;
  checklistItems: ChecklistItem[];
}

export interface StoreActions {
  setDueDate: (date: string) => void;
  addWeightEntry: (entry: Omit<WeightEntry, "id">) => void;
  removeWeightEntry: (id: string) => void;
  addSymptomEntry: (entry: Omit<SymptomEntry, "id">) => void;
  removeSymptomEntry: (id: string) => void;
  addKickSession: (session: Omit<KickSession, "id">) => void;
  removeKickSession: (id: string) => void;
  addContractionSession: (session: Omit<ContractionSession, "id">) => void;
  updateContractionSession: (id: string, session: Partial<ContractionSession>) => void;
  removeContractionSession: (id: string) => void;
  addAppointment: (appt: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, appt: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  addWater: (date: string, ml: number) => void;
  removeWater: (date: string, ml: number) => void;
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, "id">) => void;
  removeChecklistItem: (id: string) => void;
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

const initialState: StoreState = {
  dueDate: null,
  weightEntries: [],
  symptomEntries: [],
  kickSessions: [],
  contractionSessions: [],
  appointments: [],
  waterIntake: {},
  checklistItems: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `default-${i}` })),
};

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadFromStorage(): StoreState {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = localStorage.getItem("pregnancy-tracker");
    if (!stored) return initialState;
    const parsed = JSON.parse(stored) as Partial<StoreState>;
    return {
      ...initialState,
      ...parsed,
      checklistItems:
        parsed.checklistItems && parsed.checklistItems.length > 0
          ? parsed.checklistItems
          : initialState.checklistItems,
    };
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("pregnancy-tracker", JSON.stringify(state));
    }
  }, [state, mounted]);

  const setDueDate = useCallback((date: string) => {
    setState((s) => ({ ...s, dueDate: date }));
  }, []);

  const addWeightEntry = useCallback((entry: Omit<WeightEntry, "id">) => {
    setState((s) => ({
      ...s,
      weightEntries: [...s.weightEntries, { ...entry, id: generateId() }],
    }));
  }, []);

  const removeWeightEntry = useCallback((id: string) => {
    setState((s) => ({ ...s, weightEntries: s.weightEntries.filter((e) => e.id !== id) }));
  }, []);

  const addSymptomEntry = useCallback((entry: Omit<SymptomEntry, "id">) => {
    setState((s) => ({
      ...s,
      symptomEntries: [...s.symptomEntries, { ...entry, id: generateId() }],
    }));
  }, []);

  const removeSymptomEntry = useCallback((id: string) => {
    setState((s) => ({ ...s, symptomEntries: s.symptomEntries.filter((e) => e.id !== id) }));
  }, []);

  const addKickSession = useCallback((session: Omit<KickSession, "id">) => {
    setState((s) => ({
      ...s,
      kickSessions: [...s.kickSessions, { ...session, id: generateId() }],
    }));
  }, []);

  const removeKickSession = useCallback((id: string) => {
    setState((s) => ({ ...s, kickSessions: s.kickSessions.filter((k) => k.id !== id) }));
  }, []);

  const addContractionSession = useCallback((session: Omit<ContractionSession, "id">) => {
    setState((s) => ({
      ...s,
      contractionSessions: [...s.contractionSessions, { ...session, id: generateId() }],
    }));
  }, []);

  const updateContractionSession = useCallback((id: string, update: Partial<ContractionSession>) => {
    setState((s) => ({
      ...s,
      contractionSessions: s.contractionSessions.map((cs) =>
        cs.id === id ? { ...cs, ...update } : cs
      ),
    }));
  }, []);

  const removeContractionSession = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      contractionSessions: s.contractionSessions.filter((cs) => cs.id !== id),
    }));
  }, []);

  const addAppointment = useCallback((appt: Omit<Appointment, "id">) => {
    setState((s) => ({
      ...s,
      appointments: [...s.appointments, { ...appt, id: generateId() }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));
  }, []);

  const updateAppointment = useCallback((id: string, update: Partial<Appointment>) => {
    setState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...update } : a)),
    }));
  }, []);

  const removeAppointment = useCallback((id: string) => {
    setState((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
  }, []);

  const addWater = useCallback((date: string, ml: number) => {
    setState((s) => ({
      ...s,
      waterIntake: { ...s.waterIntake, [date]: (s.waterIntake[date] ?? 0) + ml },
    }));
  }, []);

  const removeWater = useCallback((date: string, ml: number) => {
    setState((s) => ({
      ...s,
      waterIntake: {
        ...s.waterIntake,
        [date]: Math.max(0, (s.waterIntake[date] ?? 0) - ml),
      },
    }));
  }, []);

  const toggleChecklistItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      checklistItems: s.checklistItems.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  }, []);

  const addChecklistItem = useCallback((item: Omit<ChecklistItem, "id">) => {
    setState((s) => ({
      ...s,
      checklistItems: [...s.checklistItems, { ...item, id: generateId() }],
    }));
  }, []);

  const removeChecklistItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      checklistItems: s.checklistItems.filter((item) => item.id !== id),
    }));
  }, []);

  const value: StoreState & StoreActions = {
    ...state,
    setDueDate,
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
  };

  return React.createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
