import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeightEntry } from "../types";

export interface WeightState {
  weightEntries: WeightEntry[];
  // Actions
  addWeightEntry: (entry: WeightEntry) => void;
  removeWeightEntry: (id: string) => void;
  updateWeightEntry: (id: string, entry: Partial<WeightEntry>) => void;
  loadWeightEntries: (entries: WeightEntry[]) => void;
  replaceWeightEntry: (tempId: string, entry: WeightEntry) => void;
}

export const useWeightStore = create<WeightState>()(
  persist(
    (set) => ({
      weightEntries: [],

      addWeightEntry: (entry) =>
        set((state) => ({
          weightEntries: [...state.weightEntries, entry],
        })),

      removeWeightEntry: (id) =>
        set((state) => ({
          weightEntries: state.weightEntries.filter((e) => e.id !== id),
        })),

      updateWeightEntry: (id, entry) =>
        set((state) => ({
          weightEntries: state.weightEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e
          ),
        })),

      loadWeightEntries: (entries) => set({ weightEntries: entries }),

      replaceWeightEntry: (tempId, entry) =>
        set((state) => ({
          weightEntries: state.weightEntries.map((e) =>
            e.id === tempId ? entry : e
          ),
        })),
    }),
    {
      name: "mamatrack-weight",
    }
  )
);
