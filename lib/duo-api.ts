/**
 * API for Duo/Partner sharing functionality
 * Allows mama to share tracking data with papa or healthcare provider
 */

import { createClient } from './supabase';

export interface DuoInvitation {
  id: string;
  mamaId: string;
  email: string;
  token: string;
  role: 'papa' | 'sagefemme' | 'famille';
  acceptedAt: string | null;
  createdAt: string;
}

export interface DuoAccess {
  id: string;
  mamaId: string;
  partnerId: string;
  role: 'papa' | 'sagefemme' | 'famille';
  createdAt: string;
  mamaProfile?: {
    mamaName: string | null;
    babyName: string | null;
    dueDate: string | null;
  };
}

// Generate a cryptographically secure unique token
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to get supabase client with any type
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient() as any;
}

// ============== INVITATIONS ==============

export async function createInvitation(
  mamaId: string,
  email: string,
  role: 'papa' | 'sagefemme' | 'famille'
): Promise<{ invitation: DuoInvitation | null; shareUrl: string | null; error: string | null }> {
  const supabase = getSupabase();
  const token = generateToken();
  
  // Check if invitation already exists
  const { data: existing } = await supabase
    .from('duo_invitations')
    .select('id')
    .eq('mama_id', mamaId)
    .eq('email', email.toLowerCase())
    .is('accepted_at', null)
    .single();
  
  if (existing) {
    return { invitation: null, shareUrl: null, error: 'Une invitation existe déjà pour cet email' };
  }
  
  const { data, error } = await supabase
    .from('duo_invitations')
    .insert({
      mama_id: mamaId,
      email: email.toLowerCase(),
      token,
      role,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating invitation:', error);
    return { invitation: null, shareUrl: null, error: 'Erreur lors de la création de l\'invitation' };
  }
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite?token=${token}`;
  
  return {
    invitation: {
      id: data.id,
      mamaId: data.mama_id,
      email: data.email,
      token: data.token,
      role: data.role,
      acceptedAt: data.accepted_at,
      createdAt: data.created_at,
    },
    shareUrl,
    error: null,
  };
}

export async function getPendingInvitations(mamaId: string): Promise<DuoInvitation[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('duo_invitations')
    .select('*')
    .eq('mama_id', mamaId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((inv: any) => ({
    id: inv.id,
    mamaId: inv.mama_id,
    email: inv.email,
    token: inv.token,
    role: inv.role,
    acceptedAt: inv.accepted_at,
    createdAt: inv.created_at,
  }));
}

export async function getInvitationByToken(token: string): Promise<DuoInvitation | null> {
  const supabase = getSupabase();
  
  // Use secure SECURITY DEFINER RPC function to avoid exposing all invitations
  const { data, error } = await supabase
    .rpc('get_invitation_by_token', { p_token: token });
  
  if (error || !data || data.length === 0) return null;
  
  const inv = data[0];
  return {
    id: inv.id,
    mamaId: inv.mama_id,
    email: inv.email,
    token: token, // token not returned by RPC for security
    role: inv.role,
    acceptedAt: inv.accepted_at,
    createdAt: inv.created_at,
  };
}

export async function acceptInvitation(token: string, _partnerId: string): Promise<boolean> {
  const supabase = getSupabase();
  
  // Use secure SECURITY DEFINER RPC function that validates and inserts atomically
  const { data, error } = await supabase
    .rpc('accept_duo_invitation', { p_token: token });
  
  if (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
  
  return data === true;
}

export async function cancelInvitation(invitationId: string): Promise<boolean> {
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('duo_invitations')
    .delete()
    .eq('id', invitationId);
  
  return !error;
}

// ============== ACCESS ==============

export async function getPartnerAccess(partnerId: string): Promise<DuoAccess[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('duo_access')
    .select(`
      *,
      profiles!duo_access_mama_id_fkey(mama_name, baby_name, due_date)
    `)
    .eq('partner_id', partnerId);
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((access: any) => ({
    id: access.id,
    mamaId: access.mama_id,
    partnerId: access.partner_id,
    role: access.role,
    createdAt: access.created_at,
    mamaProfile: access.profiles ? {
      mamaName: access.profiles.mama_name,
      babyName: access.profiles.baby_name,
      dueDate: access.profiles.due_date,
    } : undefined,
  }));
}

export async function getActivePartners(mamaId: string): Promise<DuoAccess[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('duo_access')
    .select('*')
    .eq('mama_id', mamaId);
  
  if (error || !data) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((access: any) => ({
    id: access.id,
    mamaId: access.mama_id,
    partnerId: access.partner_id,
    role: access.role,
    createdAt: access.created_at,
  }));
}

export async function revokeAccess(accessId: string): Promise<boolean> {
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('duo_access')
    .delete()
    .eq('id', accessId);
  
  return !error;
}

// Check if current user has partner access to a mama's data
export async function hasPartnerAccess(partnerId: string, mamaId: string): Promise<boolean> {
  const supabase = getSupabase();
  
  const { data } = await supabase
    .from('duo_access')
    .select('id')
    .eq('partner_id', partnerId)
    .eq('mama_id', mamaId)
    .single();
  
  return !!data;
}
