-- Fix 1 : supprimer la policy trop permissive sur duo_invitations
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON duo_invitations;

-- Fonction sécurisée pour lire une invitation par token
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token text)
RETURNS TABLE(id uuid, mama_id uuid, email text, role text, accepted_at timestamptz, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY 
  SELECT i.id, i.mama_id, i.email, i.role, i.accepted_at, i.created_at
  FROM duo_invitations i 
  WHERE i.token = p_token;
END;
$$;

-- Ajouter expires_at aux invitations (7 jours TTL)
ALTER TABLE duo_invitations ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '7 days');

-- Fix 2 : supprimer la policy duo_access INSERT sans restriction
DROP POLICY IF EXISTS "Users can insert duo access" ON duo_access;

-- Fonction sécurisée pour accepter une invitation
CREATE OR REPLACE FUNCTION accept_duo_invitation(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_invitation duo_invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation FROM duo_invitations 
  WHERE token = p_token 
    AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN RETURN false; END IF;
  
  INSERT INTO duo_access (mama_id, partner_id, role)
  VALUES (v_invitation.mama_id, auth.uid(), v_invitation.role)
  ON CONFLICT (mama_id, partner_id) DO NOTHING;
  
  UPDATE duo_invitations SET accepted_at = now() WHERE id = v_invitation.id;
  RETURN true;
END;
$$;

-- Index manquant
CREATE INDEX IF NOT EXISTS idx_duo_invitations_mama_email 
ON duo_invitations(mama_id, email) 
WHERE accepted_at IS NULL;

-- updated_at sur profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
