"use client";

import { useEffect, useState } from "react";

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "default"
  | "subscribed"
  | "error";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function PushNotificationsPanel({
  optIn,
  onOptInChange,
}: {
  optIn: boolean;
  onOptInChange: (formData: FormData) => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      try {
        const reg =
          (await navigator.serviceWorker.getRegistration("/service-worker.js")) ||
          (await navigator.serviceWorker.register("/service-worker.js"));
        await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (cancelled) return;
        if (existing) {
          setEndpoint(existing.endpoint);
          setStatus("subscribed");
          return;
        }
        setStatus(Notification.permission as Status);
      } catch (e) {
        console.error("SW init failed", e);
        if (!cancelled) setStatus("error");
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setBusy(true);
    setMsg(null);
    try {
      if (Notification.permission === "denied") {
        setStatus("denied");
        setBusy(false);
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm as Status);
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const res = await fetch("/api/enfant/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        await sub.unsubscribe();
        throw new Error("subscribe API failed");
      }
      setEndpoint(sub.endpoint);
      setStatus("subscribed");
      setMsg("Notifications activées sur ce device.");
    } catch (e) {
      console.error(e);
      setMsg("Impossible d'activer les notifications.");
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const ep = sub?.endpoint ?? endpoint;
      if (sub) await sub.unsubscribe();
      await fetch("/api/enfant/push/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: ep }),
      });
      setEndpoint(null);
      setStatus("default");
      setMsg("Notifications désactivées sur ce device.");
    } catch (e) {
      console.error(e);
      setMsg("Erreur lors de la désactivation.");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/enfant/push/test", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.hint ?? json.error ?? "Échec du test.");
      } else {
        setMsg(
          `Test envoyé sur ${json.sent}/${json.total} device${json.total > 1 ? "s" : ""}.`,
        );
      }
    } catch (e) {
      console.error(e);
      setMsg("Échec du test.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Notifications push
        </h3>
        <p className="text-xs text-foreground-muted">
          Reçois les rappels vaccins, visites HAS et RDV directement sur ton
          téléphone (PWA). Ajoute MamaTrack à l&apos;écran d&apos;accueil pour
          que ça fonctionne sur iOS.
        </p>
      </div>

      {status === "loading" && (
        <p className="text-xs text-foreground-subtle">Chargement…</p>
      )}

      {status === "unsupported" && (
        <div className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning-text">
          Ce navigateur ne supporte pas les notifications push. Sur iOS, ajoute
          d&apos;abord l&apos;app à l&apos;écran d&apos;accueil (Safari → Partager → Sur l&apos;écran
          d&apos;accueil).
        </div>
      )}

      {status === "denied" && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs text-danger-text">
          Tu as bloqué les notifications. Réautorise-les dans les réglages de
          ton navigateur pour ce site.
        </div>
      )}

      {(status === "default" || status === "error") && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {busy ? "Activation…" : "Activer les notifications"}
        </button>
      )}

      {status === "subscribed" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sendTest}
            disabled={busy}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
          >
            Envoyer une notif de test
          </button>
          <button
            type="button"
            onClick={disable}
            disabled={busy}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted transition hover:border-brand hover:text-brand disabled:opacity-50"
          >
            Désactiver sur ce device
          </button>
        </div>
      )}

      {msg && <p className="text-xs text-foreground-muted">{msg}</p>}

      <form
        action={onOptInChange}
        className="border-t border-border pt-4"
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="push_reminders"
            defaultChecked={optIn}
            className="mt-1 h-4 w-4 cursor-pointer accent-brand"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              M&apos;envoyer les rappels automatiques
            </span>
            <span className="block text-xs text-foreground-subtle">
              Vaccins (J-14), visites HAS dues, RDV agenda du lendemain.
              Décoche pour ne plus recevoir aucun rappel push (s&apos;applique à
              tous tes devices).
            </span>
          </span>
        </label>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
