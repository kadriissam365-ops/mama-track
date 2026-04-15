"use client";
import { useStore } from "@/lib/store";
import { Heart, Download, Activity, Scale } from "lucide-react";
import { useToast } from "@/lib/toast";
import { useState } from "react";

type ExportType = "weight" | "symptoms" | "all";

export default function AppleHealthSync() {
  const store = useStore();
  const toast = useToast();
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportWeightCSV = () => {
    if (store.weightEntries.length === 0) {
      toast.warning("Aucune donnée de poids à exporter");
      return;
    }
    setExporting("weight");
    const csv = [
      "Date,Poids (kg),Body Mass (kg)",
      ...store.weightEntries.map((e) => `${e.date},${e.weight},${e.weight}`),
    ].join("\n");
    downloadFile(csv, "mamatrack-poids.csv", "text/csv");
    toast.success("Export poids téléchargé !");
    setExporting(null);
  };

  const exportSymptomsCSV = () => {
    if (store.symptomEntries.length === 0) {
      toast.warning("Aucun symptôme enregistré");
      return;
    }
    setExporting("symptoms");
    const csv = [
      "Date,Symptôme,Intensité",
      ...store.symptomEntries.map((e) => `${e.date},"${e.symptom}",${e.severity ?? ""}`),
    ].join("\n");
    downloadFile(csv, "mamatrack-symptomes.csv", "text/csv");
    toast.success("Export symptômes téléchargé !");
    setExporting(null);
  };

  const exportAllJSON = () => {
    setExporting("all");
    const data = {
      exportDate: new Date().toISOString(),
      app: "MamaTrack",
      weight: store.weightEntries,
      symptoms: store.symptomEntries,
      kickSessions: store.kickSessions,
      contractionSessions: store.contractionSessions,
      waterIntake: store.waterIntake,
      appointments: store.appointments,
    };
    downloadFile(JSON.stringify(data, null, 2), "mamatrack-complet.json", "application/json");
    toast.success("Export complet téléchargé !");
    setExporting(null);
  };

  const exports = [
    {
      key: "weight" as ExportType,
      icon: Scale,
      color: "text-pink-600",
      bg: "bg-pink-50 border-pink-200 hover:bg-pink-100",
      title: "Poids (CSV)",
      subtitle: `${store.weightEntries.length} mesure${store.weightEntries.length !== 1 ? "s" : ""}`,
      desc: "Compatible Apple Santé & Google Fit",
      action: exportWeightCSV,
    },
    {
      key: "symptoms" as ExportType,
      icon: Activity,
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-200 hover:bg-violet-100",
      title: "Symptômes (CSV)",
      subtitle: `${store.symptomEntries.length} entrée${store.symptomEntries.length !== 1 ? "s" : ""}`,
      desc: "Historique complet avec dates",
      action: exportSymptomsCSV,
    },
    {
      key: "all" as ExportType,
      icon: Download,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      title: "Export complet (JSON)",
      subtitle: "Toutes les données",
      desc: "Poids, symptômes, contractions, RDV...",
      action: exportAllJSON,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1a2e] rounded-3xl p-5 shadow-sm border border-green-100 dark:border-green-900 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100">Apple Santé / Google Fit</h3>
          <p className="text-xs text-gray-400">Exportez et synchronisez vos données</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {exports.map(({ key, icon: Icon, color, bg, title, subtitle, desc, action }) => (
          <button
            key={key}
            onClick={action}
            disabled={exporting === key}
            className={`w-full flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all ${bg} ${
              exporting === key ? "opacity-60" : ""
            }`}
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
              <p className="text-xs text-gray-400">{subtitle} · {desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 border border-blue-100 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          📱 <strong>Apple Santé :</strong> Ouvrez Santé → Profil → Importer → sélectionnez le CSV
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed mt-1">
          🤖 <strong>Google Fit :</strong> Utilisez l&apos;import via Google Takeout ou l&apos;app Health Connect
        </p>
      </div>
    </div>
  );
}
