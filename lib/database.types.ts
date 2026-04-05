// Types de base de données pour MamaTrack
// Correspondant aux tables Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          due_date: string | null
          baby_name: string | null
          mama_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          due_date?: string | null
          baby_name?: string | null
          mama_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          due_date?: string | null
          baby_name?: string | null
          mama_name?: string | null
        }
      }
      weight_entries: {
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
          date?: string
          weight?: number
          note?: string | null
        }
      }
      symptom_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          symptoms: Json
          severity: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          symptoms: Json
          severity: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          symptoms?: Json
          severity?: number
          note?: string | null
        }
      }
      kick_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          start_time: string
          count: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          start_time: string
          count: number
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          count?: number
          duration?: number
        }
      }
      contraction_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          contractions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          contractions: Json
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          contractions?: Json
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          date: string
          time: string
          title: string
          doctor: string | null
          location: string | null
          notes: string | null
          done: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time: string
          title: string
          doctor?: string | null
          location?: string | null
          notes?: string | null
          done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          time?: string
          title?: string
          doctor?: string | null
          location?: string | null
          notes?: string | null
          done?: boolean
        }
      }
      water_intake: {
        Row: {
          id: string
          user_id: string
          date: string
          ml: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          ml: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          ml?: number
        }
      }
      checklist_items: {
        Row: {
          id: string
          user_id: string
          category: string
          label: string
          done: boolean
          custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          label: string
          done?: boolean
          custom?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          label?: string
          done?: boolean
          custom?: boolean
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          water_reminders: boolean
          medication_morning: boolean
          medication_evening: boolean
          appointment_reminders: boolean
          reminder_interval_hours: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          water_reminders?: boolean
          medication_morning?: boolean
          medication_evening?: boolean
          appointment_reminders?: boolean
          reminder_interval_hours?: number
          created_at?: string
        }
        Update: {
          water_reminders?: boolean
          medication_morning?: boolean
          medication_evening?: boolean
          appointment_reminders?: boolean
          reminder_interval_hours?: number
        }
      }
      duo_invitations: {
        Row: {
          id: string
          mama_id: string
          email: string
          token: string
          role: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mama_id: string
          email: string
          token: string
          role: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          accepted_at?: string | null
        }
      }
      duo_access: {
        Row: {
          id: string
          mama_id: string
          partner_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          mama_id: string
          partner_id: string
          role: string
          created_at?: string
        }
        Update: {
          role?: string
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Types d'export pour l'app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type WeightEntry = Database['public']['Tables']['weight_entries']['Row']
export type SymptomEntry = Database['public']['Tables']['symptom_entries']['Row']
export type KickSession = Database['public']['Tables']['kick_sessions']['Row']
export type ContractionSession = Database['public']['Tables']['contraction_sessions']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type WaterIntake = Database['public']['Tables']['water_intake']['Row']
export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']
