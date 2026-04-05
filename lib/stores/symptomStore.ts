import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SymptomEntry } from "../types";

export interface SymptomState {
  symptomEntries: SymptomEntry[];
  // Actions
  addSymptomEntry: (entry: SymptomEntry) => void;
  removeSymptomEntry: (id: string) => void;
  updateSymptomEntry: (id: string, entry: Partial<SymptomEntry>) => void;
  loadSymptomEntries: (entries: SymptomEntry[]) => void;
  replaceSymptomEntry: (tempId: string, entry: SymptomEntry) => void;
}

export const useSymptomStore = create<SymptomState>()(
  persist(
    (set) => ({
      symptomEntries: [],

      addSymptomEntry: (entry) =>
        set((state) => ({
          symptomEntries: [...state.symptomEntries, entry],
        })),

      removeSymptomEntry: (id) =>
        set((state) => ({
          symptomEntries: state.symptomEntries.filter((e) => e.id !== id),
        })),

      updateSymptomEntry: (id, entry) =>
        set((state) => ({
          symptomEntries: state.symptomEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e
          ),
        })),

      loadSymptomEntries: (entries) => set({ symptomEntries: entries }),

      replaceSymptomEntry: (tempId, entry) =>
        set((state) => ({
          symptomEntries: state.symptomEntries.map((e) =>
            e.id === tempId ? entry : e
          ),
        })),
    }),
    {
      name: "mamatrack-symptoms",
    }
  )
);
