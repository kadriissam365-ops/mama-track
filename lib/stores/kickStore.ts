import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KickSession } from "../types";

export interface KickState {
  kickSessions: KickSession[];
  // Actions
  addKickSession: (session: KickSession) => void;
  removeKickSession: (id: string) => void;
  updateKickSession: (id: string, session: Partial<KickSession>) => void;
  loadKickSessions: (sessions: KickSession[]) => void;
  replaceKickSession: (tempId: string, session: KickSession) => void;
}

export const useKickStore = create<KickState>()(
  persist(
    (set) => ({
      kickSessions: [],

      addKickSession: (session) =>
        set((state) => ({
          kickSessions: [...state.kickSessions, session],
        })),

      removeKickSession: (id) =>
        set((state) => ({
          kickSessions: state.kickSessions.filter((k) => k.id !== id),
        })),

      updateKickSession: (id, session) =>
        set((state) => ({
          kickSessions: state.kickSessions.map((k) =>
            k.id === id ? { ...k, ...session } : k
          ),
        })),

      loadKickSessions: (sessions) => set({ kickSessions: sessions }),

      replaceKickSession: (tempId, session) =>
        set((state) => ({
          kickSessions: state.kickSessions.map((k) =>
            k.id === tempId ? session : k
          ),
        })),
    }),
    {
      name: "mamatrack-kicks",
    }
  )
);
