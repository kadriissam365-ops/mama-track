import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProfileState {
  dueDate: string | null;
  mamaName: string | null;
  babyName: string | null;
  // Actions
  setDueDate: (date: string) => void;
  setMamaName: (name: string) => void;
  setBabyName: (name: string) => void;
  setProfile: (profile: { dueDate?: string; mamaName?: string; babyName?: string }) => void;
  loadProfile: (profile: { dueDate?: string | null; mamaName?: string | null; babyName?: string | null }) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      dueDate: null,
      mamaName: null,
      babyName: null,

      setDueDate: (date) => set({ dueDate: date }),
      setMamaName: (name) => set({ mamaName: name }),
      setBabyName: (name) => set({ babyName: name }),
      setProfile: (profile) =>
        set((state) => ({
          dueDate: profile.dueDate ?? state.dueDate,
          mamaName: profile.mamaName ?? state.mamaName,
          babyName: profile.babyName ?? state.babyName,
        })),
      loadProfile: (profile) =>
        set({
          dueDate: profile.dueDate ?? null,
          mamaName: profile.mamaName ?? null,
          babyName: profile.babyName ?? null,
        }),
    }),
    {
      name: "mamatrack-profile",
    }
  )
);
