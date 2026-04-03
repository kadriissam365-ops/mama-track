// Types de base de données générique pour MamaTrack
// La table profiles existe dans le projet Supabase avec une structure différente
// On utilise des types génériques pour la compatibilité

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          company: string | null
          phone: string | null
          role: string | null
          created_at: string
          updated_at: string
          email: string | null
          password_hash: string | null
          avatar_url: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          budget_allocated: number | null
          notes: string | null
          status: string | null
          full_name: string | null
          // MamaTrack specific fields (may need to be added via migration)
          due_date?: string | null
          baby_name?: string | null
          mama_name?: string | null
        }
        Insert: {
          id: string
          name?: string | null
          company?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          email?: string | null
          password_hash?: string | null
          avatar_url?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          budget_allocated?: number | null
          notes?: string | null
          status?: string | null
          full_name?: string | null
          due_date?: string | null
          baby_name?: string | null
          mama_name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          company?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
          email?: string | null
          password_hash?: string | null
          avatar_url?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          budget_allocated?: number | null
          notes?: string | null
          status?: string | null
          full_name?: string | null
          due_date?: string | null
          baby_name?: string | null
          mama_name?: string | null
        }
      }
      // Tables spécifiques MamaTrack (peuvent être ajoutées)
      mama_weight_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          note?: string | null
          created_at?: string
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Types d'export pour MamaTrack
export interface MamaProfile {
  id: string
  due_date: string | null
  baby_name: string | null
  mama_name: string | null
  created_at?: string
}

export interface ContractionEntry {
  id: string
  startTime: number
  endTime?: number
  duration?: number
  interval?: number
}
