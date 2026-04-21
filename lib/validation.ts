/**
 * Validation centralisée pour MamaTrack
 * Fonctions utilitaires pour valider les inputs avant insertion en base
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Poids : entre 30 et 200 kg
export function validateWeight(weight: number): ValidationResult {
  if (typeof weight !== 'number' || isNaN(weight)) {
    return { valid: false, error: 'Le poids doit être un nombre valide' };
  }
  if (weight < 20) {
    return { valid: false, error: 'Le poids doit être supérieur à 20 kg' };
  }
  if (weight > 300) {
    return { valid: false, error: 'Le poids doit être inférieur à 300 kg' };
  }
  return { valid: true };
}

// Notes : max 500 caractères
export function validateNote(note: string | undefined | null): ValidationResult {
  if (!note) return { valid: true }; // Note optionnelle
  if (note.length > 500) {
    return { valid: false, error: 'La note ne peut pas dépasser 500 caractères' };
  }
  return { valid: true };
}

// Noms : max 100 caractères
export function validateName(name: string | undefined | null): ValidationResult {
  if (!name) return { valid: true }; // Nom optionnel
  if (name.length > 100) {
    return { valid: false, error: 'Le nom ne peut pas dépasser 100 caractères' };
  }
  return { valid: true };
}

// Email basique
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'L\'email est requis' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'L\'email n\'est pas valide' };
  }
  return { valid: true };
}

// Date au format YYYY-MM-DD
export function validateDate(date: string): ValidationResult {
  if (!date) {
    return { valid: false, error: 'La date est requise' };
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { valid: false, error: 'Format de date invalide (YYYY-MM-DD attendu)' };
  }
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'Date invalide' };
  }
  return { valid: true };
}

// Severité symptômes : entre 1 et 10
export function validateSeverity(severity: number): ValidationResult {
  if (typeof severity !== 'number' || isNaN(severity)) {
    return { valid: false, error: 'La sévérité doit être un nombre valide' };
  }
  if (severity < 1 || severity > 10) {
    return { valid: false, error: 'La sévérité doit être entre 1 et 10' };
  }
  return { valid: true };
}

// Helper : throw si invalide
export function assertValid(result: ValidationResult): void {
  if (!result.valid) {
    throw new Error(result.error ?? 'Validation échouée');
  }
}
