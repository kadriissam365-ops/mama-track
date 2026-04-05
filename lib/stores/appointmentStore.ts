import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Appointment } from "../types";

export interface AppointmentState {
  appointments: Appointment[];
  // Actions
  addAppointment: (appt: Appointment) => void;
  removeAppointment: (id: string) => void;
  updateAppointment: (id: string, appt: Partial<Appointment>) => void;
  loadAppointments: (appts: Appointment[]) => void;
  replaceAppointment: (tempId: string, appt: Appointment) => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set) => ({
      appointments: [],

      addAppointment: (appt) =>
        set((state) => ({
          appointments: [...state.appointments, appt].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        })),

      removeAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
        })),

      updateAppointment: (id, appt) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...appt } : a
          ),
        })),

      loadAppointments: (appts) => set({ appointments: appts }),

      replaceAppointment: (tempId, appt) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === tempId ? appt : a
          ),
        })),
    }),
    {
      name: "mamatrack-appointments",
    }
  )
);
