import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContractionSession } from "../types";

export interface ContractionState {
  contractionSessions: ContractionSession[];
  // Actions
  addContractionSession: (session: ContractionSession) => void;
  removeContractionSession: (id: string) => void;
  updateContractionSession: (id: string, session: Partial<ContractionSession>) => void;
  loadContractionSessions: (sessions: ContractionSession[]) => void;
  replaceContractionSession: (tempId: string, session: ContractionSession) => void;
}

export const useContractionStore = create<ContractionState>()(
  persist(
    (set) => ({
      contractionSessions: [],

      addContractionSession: (session) =>
        set((state) => ({
          contractionSessions: [...state.contractionSessions, session],
        })),

      removeContractionSession: (id) =>
        set((state) => ({
          contractionSessions: state.contractionSessions.filter((c) => c.id !== id),
        })),

      updateContractionSession: (id, session) =>
        set((state) => ({
          contractionSessions: state.contractionSessions.map((c) =>
            c.id === id ? { ...c, ...session } : c
          ),
        })),

      loadContractionSessions: (sessions) => set({ contractionSessions: sessions }),

      replaceContractionSession: (tempId, session) =>
        set((state) => ({
          contractionSessions: state.contractionSessions.map((c) =>
            c.id === tempId ? session : c
          ),
        })),
    }),
    {
      name: "mamatrack-contractions",
    }
  )
);
