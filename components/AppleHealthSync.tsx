"use client";
import { useStore } from "@/lib/store";
import { Heart, Download } from "lucide-react";
import { useToast } from "@/lib/toast";

export default function AppleHealthSync() {
  const store = useStore();
  const toast = useToast();

  // Apple Health direct web sync n'est pas possible via Web API standard.
  // On propose 2 alternatives :
  // 1. Export CSV des données de poids → l'utilisateur peut l'importer manuellement
  // 2. Instructions pour connecter via iPhone Santé

  const exportWeightCSV = () => {
    if (store.weightEntries.length === 0) {
      toast.warning("Aucune donnée de poids à exporter");
      return;
    }
    const csv = [
      "Date,Poids (kg)",
      ...store.weightEntries.map((e) => `${e.date},${e.weight}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mamatrack-poids.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé !");
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-100 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-[#3d2b2b]">Apple Santé</h3>
          <p className="text-xs text-gray-400">Synchronisation des données</p>
        </div>
      </div>

      <div className="bg-orange-50 rounded-2xl p-3 border border-orange-100">
        <p className="text-xs text-orange-700 leading-relaxed">
          📱 <strong>Note :</strong> La synchronisation directe avec Apple Santé
          nécessite une app native iOS. En attendant, exportez vos données et
          importez-les manuellement dans l&apos;app Santé.
        </p>
      </div>

      <button
        onClick={exportWeightCSV}
        className="w-full flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 hover:bg-green-100 transition-colors"
      >
        <Download className="w-5 h-5 text-green-600" />
        <div className="text-left">
          <p className="text-sm font-semibold text-green-700">
            Exporter mon poids (CSV)
          </p>
          <p className="text-xs text-green-500">
            {store.weightEntries.length} mesure
            {store.weightEntries.length !== 1 ? "s" : ""} disponible
            {store.weightEntries.length !== 1 ? "s" : ""}
          </p>
        </div>
      </button>

      <div className="text-xs text-gray-400 leading-relaxed space-y-1">
        <p className="font-medium text-gray-500">Comment importer dans Santé :</p>
        <p>1. Ouvrez l&apos;app Santé sur iPhone</p>
        <p>2. Profil → Importer des données</p>
        <p>3. Sélectionnez le fichier CSV exporté</p>
      </div>
    </div>
  );
}
