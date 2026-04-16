"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { Download, FileJson, FileText, Trash2, Loader2, Shield, ChevronDown, ChevronUp } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ExportData {
  metadata: {
    exportDate: string;
    userEmail: string;
    userId: string;
    appName: string;
    appVersion: string;
    format: string;
  };
  profile: Record<string, unknown> | null;
  weightEntries: Record<string, unknown>[];
  symptomEntries: Record<string, unknown>[];
  kickSessions: Record<string, unknown>[];
  contractionSessions: Record<string, unknown>[];
  appointments: Record<string, unknown>[];
  waterIntake: Record<string, unknown>[];
  checklistItems: Record<string, unknown>[];
  notificationSettings: Record<string, unknown> | null;
  bumpPhotos: Record<string, unknown>[];
  journalNotes: Record<string, unknown>[];
  communityPosts: Record<string, unknown>[];
  pushSubscriptions: Record<string, unknown>[];
}

interface DataCategory {
  key: keyof Omit<ExportData, "metadata">;
  label: string;
  count: number;
}

export default function DataExport() {
  const { user, signOut } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinalConfirm, setShowDeleteFinalConfirm] = useState(false);

  const fetchExportData = useCallback(async (): Promise<ExportData | null> => {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        throw new Error("Erreur lors du chargement");
      }
      return await res.json();
    } catch {
      toast.error("Impossible de charger vos donnees");
      return null;
    }
  }, [toast]);

  // Load counts on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const data = await fetchExportData();
      if (cancelled || !data) return;
      setExportData(data);
      setCategories(buildCategories(data));
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function buildCategories(data: ExportData): DataCategory[] {
    return [
      { key: "profile", label: "Profil", count: data.profile ? 1 : 0 },
      { key: "weightEntries", label: "Entrees de poids", count: data.weightEntries.length },
      { key: "symptomEntries", label: "Symptomes", count: data.symptomEntries.length },
      { key: "kickSessions", label: "Sessions de coups de pied", count: data.kickSessions.length },
      { key: "contractionSessions", label: "Sessions de contractions", count: data.contractionSessions.length },
      { key: "appointments", label: "Rendez-vous", count: data.appointments.length },
      { key: "waterIntake", label: "Hydratation", count: data.waterIntake.length },
      { key: "checklistItems", label: "Checklist", count: data.checklistItems.length },
      { key: "notificationSettings", label: "Preferences de notifications", count: data.notificationSettings ? 1 : 0 },
      { key: "bumpPhotos", label: "Photos de ventre", count: data.bumpPhotos.length },
      { key: "journalNotes", label: "Notes de journal", count: data.journalNotes.length },
      { key: "communityPosts", label: "Publications communaute", count: data.communityPosts.length },
      { key: "pushSubscriptions", label: "Abonnements push", count: data.pushSubscriptions.length },
    ];
  }

  const totalItems = categories.reduce((sum, c) => sum + c.count, 0);

  const handleExportJSON = async () => {
    setLoading(true);
    try {
      const data = exportData ?? await fetchExportData();
      if (!data) return;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mamatrack-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export JSON telecharge !");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const data = exportData ?? await fetchExportData();
      if (!data) return;

      // Dynamic import to keep bundle smaller
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      const addPageIfNeeded = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Title
      doc.setFontSize(20);
      doc.setTextColor(219, 39, 119); // pink-600
      doc.text("MamaTrack - Export de donnees", pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(`Date d'export : ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, y, { align: "center" });
      y += 5;
      doc.text(`Email : ${data.metadata.userEmail}`, pageWidth / 2, y, { align: "center" });
      y += 12;

      // Helper for section headers
      const addSection = (title: string) => {
        addPageIfNeeded(20);
        doc.setFontSize(14);
        doc.setTextColor(88, 28, 135); // purple-800
        doc.text(title, 14, y);
        y += 2;
        doc.setDrawColor(219, 39, 119);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 8;
      };

      // Profile
      if (data.profile) {
        addSection("Profil");
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        const profile = data.profile as Record<string, unknown>;
        const profileLines = [
          `Prenom : ${profile.mama_name ?? "Non renseigne"}`,
          `Prenom de bebe : ${profile.baby_name ?? "Non renseigne"}`,
          `Date prevue d'accouchement : ${profile.due_date ?? "Non renseignee"}`,
        ];
        for (const line of profileLines) {
          addPageIfNeeded(7);
          doc.text(line, 14, y);
          y += 7;
        }
        y += 5;
      }

      // Weight entries
      if (data.weightEntries.length > 0) {
        addSection(`Poids (${data.weightEntries.length} entrees)`);
        autoTable(doc, {
          startY: y,
          head: [["Date", "Poids (kg)", "Note"]],
          body: data.weightEntries.map((e: Record<string, unknown>) => [
            String(e.date ?? ""),
            String(e.weight ?? ""),
            String(e.note ?? ""),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Symptoms
      if (data.symptomEntries.length > 0) {
        addSection(`Symptomes (${data.symptomEntries.length} entrees)`);
        autoTable(doc, {
          startY: y,
          head: [["Date", "Symptomes", "Severite", "Note"]],
          body: data.symptomEntries.map((e: Record<string, unknown>) => [
            String(e.date ?? ""),
            Array.isArray(e.symptoms) ? e.symptoms.join(", ") : "",
            String(e.severity ?? ""),
            String(e.note ?? ""),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Kick sessions
      if (data.kickSessions.length > 0) {
        addSection(`Coups de pied (${data.kickSessions.length} sessions)`);
        autoTable(doc, {
          startY: y,
          head: [["Date", "Heure", "Nombre", "Duree (s)"]],
          body: data.kickSessions.map((k: Record<string, unknown>) => [
            String(k.date ?? ""),
            String(k.start_time ?? ""),
            String(k.count ?? ""),
            String(k.duration ?? ""),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Contractions
      if (data.contractionSessions.length > 0) {
        addSection(`Contractions (${data.contractionSessions.length} sessions)`);
        autoTable(doc, {
          startY: y,
          head: [["Date", "Nombre de contractions"]],
          body: data.contractionSessions.map((c: Record<string, unknown>) => [
            String(c.date ?? ""),
            String(Array.isArray(c.contractions) ? c.contractions.length : 0),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Appointments
      if (data.appointments.length > 0) {
        addSection(`Rendez-vous (${data.appointments.length})`);
        autoTable(doc, {
          startY: y,
          head: [["Date", "Heure", "Titre", "Medecin", "Lieu", "Notes"]],
          body: data.appointments.map((a: Record<string, unknown>) => [
            String(a.date ?? ""),
            String(a.time ?? ""),
            String(a.title ?? ""),
            String(a.doctor ?? ""),
            String(a.location ?? ""),
            String(a.notes ?? ""),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Water intake
      if (data.waterIntake.length > 0) {
        addSection(`Hydratation (${data.waterIntake.length} jours)`);
        autoTable(doc, {
          startY: y,
          head: [["Date", "Quantite (ml)"]],
          body: data.waterIntake.map((w: Record<string, unknown>) => [
            String(w.date ?? ""),
            String(w.ml ?? ""),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Checklist
      if (data.checklistItems.length > 0) {
        addSection(`Checklist (${data.checklistItems.length} elements)`);
        autoTable(doc, {
          startY: y,
          head: [["Categorie", "Element", "Fait"]],
          body: data.checklistItems.map((c: Record<string, unknown>) => [
            String(c.category ?? ""),
            String(c.label ?? ""),
            c.done ? "Oui" : "Non",
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Journal notes
      if (data.journalNotes.length > 0) {
        addSection(`Journal (${data.journalNotes.length} notes)`);
        for (const note of data.journalNotes as Record<string, unknown>[]) {
          addPageIfNeeded(25);
          doc.setFontSize(10);
          doc.setTextColor(88, 28, 135);
          doc.text(
            `Semaine ${note.week ?? "?"} ${note.mood_emoji ?? ""} - ${note.title ?? "Sans titre"}`,
            14,
            y
          );
          y += 6;
          doc.setTextColor(55, 65, 81);
          doc.setFontSize(9);
          const lines = doc.splitTextToSize(String(note.body ?? ""), pageWidth - 28);
          for (const line of lines) {
            addPageIfNeeded(6);
            doc.text(line, 14, y);
            y += 5;
          }
          y += 5;
        }
      }

      // Bump photos metadata
      if (data.bumpPhotos.length > 0) {
        addSection(`Photos de ventre (${data.bumpPhotos.length})`);
        autoTable(doc, {
          startY: y,
          head: [["Semaine", "Date de capture", "Note"]],
          body: data.bumpPhotos.map((p: Record<string, unknown>) => [
            String(p.week ?? ""),
            String(p.captured_at ?? ""),
            String(p.note ?? ""),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Community posts
      if (data.communityPosts.length > 0) {
        addSection(`Publications communaute (${data.communityPosts.length})`);
        autoTable(doc, {
          startY: y,
          head: [["Semaine", "Type", "Contenu", "Date"]],
          body: data.communityPosts.map((p: Record<string, unknown>) => [
            String(p.week ?? ""),
            String(p.type ?? ""),
            String(p.content ?? "").substring(0, 80),
            String(p.created_at ?? "").slice(0, 10),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [219, 39, 119] },
          margin: { left: 14, right: 14 },
        });
      }

      // Footer
      doc.addPage();
      y = 20;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(
        "Ce document a ete genere automatiquement par MamaTrack conformement au RGPD.",
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 7;
      doc.text(
        `Export realise le ${new Date().toLocaleDateString("fr-FR")} a ${new Date().toLocaleTimeString("fr-FR")}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );

      doc.save(`mamatrack-export-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Export PDF telecharge !");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteFinalConfirm(false);
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }
      toast.success("Compte supprime. Au revoir !");
      // Sign out and redirect
      await signOut();
    } catch {
      toast.error("Erreur lors de la suppression du compte");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Data overview card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Donnees & Confidentialite</h3>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Conformement au RGPD, vous pouvez exporter ou supprimer toutes vos donnees personnelles a tout moment.
        </p>

        {/* Data summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
              {totalItems} elements stockes
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-purple-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-500" />
            )}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-1.5">
              {categories.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300">{cat.label}</span>
                  <span className="font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export buttons */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Exporter mes donnees
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              disabled={loading}
              className="flex-1 py-3 bg-purple-50 dark:bg-purple-950/300 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileJson className="w-4 h-4" />
              )}
              JSON
            </button>
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="flex-1 py-3 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              PDF
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Le fichier sera telecharge sur votre appareil
          </p>
        </div>
      </div>

      {/* Delete account */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-red-100 dark:border-red-900/30 space-y-4">
        <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
          <Trash2 className="w-4 h-4" />
          Zone de danger
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          La suppression de votre compte est irreversible. Toutes vos donnees seront definitivement effacees.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          className="w-full py-3 bg-white dark:bg-gray-900 border-2 border-red-300 dark:border-red-700 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:bg-red-950/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Suppression en cours...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte
            </>
          )}
        </button>
      </div>

      {/* First confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer votre compte ?"
        message="Toutes vos donnees de suivi de grossesse seront definitivement supprimees. Cette action est irreversible."
        confirmLabel="Continuer"
        danger
        onConfirm={() => {
          setShowDeleteConfirm(false);
          setShowDeleteFinalConfirm(true);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Second (final) confirmation */}
      <ConfirmDialog
        isOpen={showDeleteFinalConfirm}
        title="Derniere confirmation"
        message="Etes-vous vraiment sure ? Toutes vos donnees (poids, symptomes, rendez-vous, journal, photos...) seront perdues definitivement."
        confirmLabel="Supprimer definitivement"
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteFinalConfirm(false)}
      />
    </div>
  );
}
