"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mamatrack:ai-consent:v1";

export interface AiConsentRecord {
  accepted: boolean;
  acceptedAt: string | null;
  version: 1;
}

const EMPTY: AiConsentRecord = { accepted: false, acceptedAt: null, version: 1 };

function read(): AiConsentRecord {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AiConsentRecord;
    if (parsed && parsed.accepted === true && parsed.version === 1) return parsed;
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useAiConsent() {
  const [record, setRecord] = useState<AiConsentRecord>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecord(read());
    setHydrated(true);
  }, []);

  const accept = useCallback(() => {
    const next: AiConsentRecord = {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      version: 1,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setRecord(next);
  }, []);

  const revoke = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setRecord(EMPTY);
  }, []);

  return {
    hydrated,
    accepted: record.accepted,
    acceptedAt: record.acceptedAt,
    accept,
    revoke,
  };
}
