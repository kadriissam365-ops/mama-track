import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WaterIntakeDay } from "../types";

export interface WaterState {
  waterIntake: WaterIntakeDay;
  // Actions
  addWater: (date: string, ml: number) => void;
  removeWater: (date: string, ml: number) => void;
  setWaterForDate: (date: string, ml: number) => void;
  loadWaterIntake: (intake: WaterIntakeDay) => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set) => ({
      waterIntake: {},

      addWater: (date, ml) =>
        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [date]: (state.waterIntake[date] ?? 0) + ml,
          },
        })),

      removeWater: (date, ml) =>
        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [date]: Math.max(0, (state.waterIntake[date] ?? 0) - ml),
          },
        })),

      setWaterForDate: (date, ml) =>
        set((state) => ({
          waterIntake: { ...state.waterIntake, [date]: ml },
        })),

      loadWaterIntake: (intake) => set({ waterIntake: intake }),
    }),
    {
      name: "mamatrack-water",
    }
  )
);
