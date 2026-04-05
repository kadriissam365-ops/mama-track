import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChecklistItem } from "../types";

export const DEFAULT_CHECKLIST: Omit<ChecklistItem, "id">[] = [
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

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = DEFAULT_CHECKLIST.map((item, i) => ({
  ...item,
  id: `default-${i}`,
}));

export interface ChecklistState {
  checklistItems: ChecklistItem[];
  // Actions
  addChecklistItem: (item: ChecklistItem) => void;
  removeChecklistItem: (id: string) => void;
  toggleChecklistItem: (id: string) => void;
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void;
  loadChecklistItems: (items: ChecklistItem[]) => void;
  replaceChecklistItem: (tempId: string, item: ChecklistItem) => void;
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set) => ({
      checklistItems: DEFAULT_CHECKLIST_ITEMS,

      addChecklistItem: (item) =>
        set((state) => ({
          checklistItems: [...state.checklistItems, item],
        })),

      removeChecklistItem: (id) =>
        set((state) => ({
          checklistItems: state.checklistItems.filter((c) => c.id !== id),
        })),

      toggleChecklistItem: (id) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((c) =>
            c.id === id ? { ...c, done: !c.done } : c
          ),
        })),

      updateChecklistItem: (id, item) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((c) =>
            c.id === id ? { ...c, ...item } : c
          ),
        })),

      loadChecklistItems: (items) => set({ checklistItems: items }),

      replaceChecklistItem: (tempId, item) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((c) =>
            c.id === tempId ? item : c
          ),
        })),
    }),
    {
      name: "mamatrack-checklist",
      // If persisted state has an empty checklist (e.g. corrupted/old data), restore defaults
      merge: (persisted: unknown, current: ChecklistState) => {
        const persistedState = persisted as Partial<ChecklistState>;
        if (!persistedState.checklistItems || persistedState.checklistItems.length === 0) {
          return { ...current, checklistItems: DEFAULT_CHECKLIST_ITEMS };
        }
        return { ...current, ...persistedState };
      },
    }
  )
);
