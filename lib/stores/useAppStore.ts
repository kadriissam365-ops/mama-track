/**
 * useAppStore — hook composite pour la rétrocompatibilité
 * Combine tous les sous-stores Zustand et expose la même API que l'ancien useStore()
 *
 * Usage: import { useAppStore } from "@/lib/stores/useAppStore"
 * ou continuer à utiliser useStore() depuis lib/store.ts (qui délègue ici)
 */

import { useProfileStore } from "./profileStore";
import { useWeightStore } from "./weightStore";
import { useSymptomStore } from "./symptomStore";
import { useWaterStore } from "./waterStore";
import { useKickStore } from "./kickStore";
import { useContractionStore } from "./contractionStore";
import { useAppointmentStore } from "./appointmentStore";
import { useChecklistStore } from "./checklistStore";

export function useAppStore() {
  // Profile
  const { dueDate, mamaName, babyName, setProfile: _setProfile, loadProfile } = useProfileStore();

  // Weight
  const {
    weightEntries,
    addWeightEntry: _addWeightEntry,
    removeWeightEntry,
    loadWeightEntries,
    replaceWeightEntry,
  } = useWeightStore();

  // Symptoms
  const {
    symptomEntries,
    addSymptomEntry: _addSymptomEntry,
    removeSymptomEntry,
    loadSymptomEntries,
    replaceSymptomEntry,
  } = useSymptomStore();

  // Water
  const {
    waterIntake,
    addWater: _addWater,
    removeWater: _removeWater,
    loadWaterIntake,
  } = useWaterStore();

  // Kicks
  const {
    kickSessions,
    addKickSession: _addKickSession,
    removeKickSession,
    loadKickSessions,
    replaceKickSession,
  } = useKickStore();

  // Contractions
  const {
    contractionSessions,
    addContractionSession: _addContractionSession,
    updateContractionSession: _updateContractionSession,
    removeContractionSession,
    loadContractionSessions,
    replaceContractionSession,
  } = useContractionStore();

  // Appointments
  const {
    appointments,
    addAppointment: _addAppointment,
    updateAppointment: _updateAppointment,
    removeAppointment,
    loadAppointments,
    replaceAppointment,
  } = useAppointmentStore();

  // Checklist
  const {
    checklistItems,
    addChecklistItem: _addChecklistItem,
    removeChecklistItem,
    toggleChecklistItem: _toggleChecklistItem,
    loadChecklistItems,
    replaceChecklistItem,
  } = useChecklistStore();

  return {
    // State
    dueDate,
    mamaName,
    babyName,
    weightEntries,
    symptomEntries,
    waterIntake,
    kickSessions,
    contractionSessions,
    appointments,
    checklistItems,

    // Internal store actions (for direct Zustand usage)
    _storeActions: {
      loadProfile,
      loadWeightEntries,
      replaceWeightEntry,
      loadSymptomEntries,
      replaceSymptomEntry,
      loadWaterIntake,
      loadKickSessions,
      replaceKickSession,
      loadContractionSessions,
      replaceContractionSession,
      loadAppointments,
      replaceAppointment,
      loadChecklistItems,
      replaceChecklistItem,
    },

    // Exposed actions mirroring the old useStore() API
    setProfile: _setProfile,
    setDueDate: (date: string) => _setProfile({ dueDate: date }),

    addWeightEntry: _addWeightEntry,
    removeWeightEntry,

    addSymptomEntry: _addSymptomEntry,
    removeSymptomEntry,

    addWater: _addWater,
    removeWater: _removeWater,

    addKickSession: _addKickSession,
    removeKickSession,

    addContractionSession: _addContractionSession,
    updateContractionSession: _updateContractionSession,
    removeContractionSession,

    addAppointment: _addAppointment,
    updateAppointment: _updateAppointment,
    removeAppointment,

    addChecklistItem: _addChecklistItem,
    removeChecklistItem,
    toggleChecklistItem: _toggleChecklistItem,
  };
}
