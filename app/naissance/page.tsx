"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, ChevronDown, ChevronUp, Check, X, Loader2, CheckCircle2 } from "lucide-react";
import type jsPDFType from "jspdf";
import { notifyPartner } from "@/lib/partner-notify-client";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";

interface ProjetNaissance {
  // Section 1 - Infos
  mamanNom: string;
  papaPartenaireNom: string;
  maternite: string;
  medecin: string;
  datePrevu: string;
  // Section 2 - Lieu & ambiance
  typeSalle: string;
  lumiereTamisee: boolean;
  musique: boolean;
  musiqueDetails: string;
  accompagnants: string;
  // Section 3 - Gestion douleur
  peridurale: "oui" | "non" | "selon";
  protoxyde: boolean;
  bain: boolean;
  massage: boolean;
  autresDouleur: string;
  // Section 4 - Accouchement
  positionsLibres: boolean;
  monitoringContinu: boolean;
  rupturePoche: "naturelle" | "artificielle" | "selon";
  // Section 5 - Naissance
  peauPeau: boolean;
  clampageCordeDiffere: boolean;
  pereCoupeCordon: boolean;
  // Section 6 - Nouveau-né
  vitamineK: boolean;
  allaitement: "oui" | "non" | "essayer";
  bainDiffere: boolean;
  // Section 7 - Césarienne
  cesariennePeauPeau: boolean;
  cesariennePartenaire: boolean;
  cesarienneNotesLibres: string;
  // Section 8 - Notes
  notes: string;
}

const DEFAULT_PROJET: ProjetNaissance = {
  mamanNom: "", papaPartenaireNom: "", maternite: "", medecin: "", datePrevu: "",
  typeSalle: "Salle classique", lumiereTamisee: true, musique: false, musiqueDetails: "", accompagnants: "",
  peridurale: "selon", protoxyde: false, bain: false, massage: true, autresDouleur: "",
  positionsLibres: true, monitoringContinu: false, rupturePoche: "naturelle",
  peauPeau: true, clampageCordeDiffere: true, pereCoupeCordon: true,
  vitamineK: true, allaitement: "oui", bainDiffere: true,
  cesariennePeauPeau: true, cesariennePartenaire: true, cesarienneNotesLibres: "",
  notes: "",
};

const SECTIONS = [
  { id: 1, title: "👶 Informations générales", emoji: "👶" },
  { id: 2, title: "🌸 Lieu & ambiance", emoji: "🌸" },
  { id: 3, title: "💊 Gestion de la douleur", emoji: "💊" },
  { id: 4, title: "🤱 Accouchement", emoji: "🤱" },
  { id: 5, title: "✨ La naissance", emoji: "✨" },
  { id: 6, title: "🍼 Nouveau-né", emoji: "🍼" },
  { id: 7, title: "🏥 Césarienne (si nécessaire)", emoji: "🏥" },
  { id: 8, title: "📝 Notes libres", emoji: "📝" },
];

function BooleanField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          value ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        }`}
      >
        {value ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
        {value ? "Oui" : "Non"}
      </button>
    </div>
  );
}

function RadioField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              value === opt.value ? "bg-pink-400 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NaissancePage() {
  const { birthPlan, saveBirthPlanData } = useStore();
  const toast = useToast();
  const [projet, setProjet] = useState<ProjetNaissance>(DEFAULT_PROJET);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from store: remote (authoritative) merged with local fallback.
  useEffect(() => {
    if (!birthPlan) return;
    setProjet(prev => ({ ...prev, ...(birthPlan as Partial<ProjetNaissance>) }));
  }, [birthPlan]);

  const update = <K extends keyof ProjetNaissance>(key: K, value: ProjetNaissance[K]) => {
    setProjet(prev => {
      const next = { ...prev, [key]: value };
      // Debounced persist (store handles local + remote).
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveBirthPlanData(next as unknown as Record<string, unknown>);
      }, 600);
      return next;
    });
  };

  const toggleSection = (id: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const boolLabel = (v: boolean) => v ? "✅ Oui" : "❌ Non";

  const exportPDF = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.getWidth();
      let y = 0;

      // Header
      doc.setFillColor(244, 114, 182);
      doc.rect(0, 0, pw, 45, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("MamaTrack", pw / 2, 18, { align: "center" });
      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.text("Projet de naissance", pw / 2, 30, { align: "center" });
      doc.setFontSize(9);
      doc.text(`Préparé pour : ${projet.mamanNom || "..."}  •  Date prévue : ${projet.datePrevu || "..."}`, pw / 2, 40, { align: "center" });

      y = 55;
      doc.setTextColor(0, 0, 0);

      const checkPage = () => {
        if (y > 270) { doc.addPage(); y = 20; }
      };

      const addSection = (title: string, lines: string[]) => {
        checkPage();
        doc.setFillColor(252, 231, 243);
        doc.rect(10, y - 5, pw - 20, 10, "F");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 50, 100);
        doc.text(title, 14, y + 2);
        y += 10;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        for (const line of lines) {
          checkPage();
          doc.text(line, 14, y);
          y += 6;
        }
        y += 4;
      };

      addSection("1. Informations générales", [
        `Maman : ${projet.mamanNom || "Non renseigné"}`,
        `Papa/Partenaire : ${projet.papaPartenaireNom || "Non renseigné"}`,
        `Maternité : ${projet.maternite || "Non renseigné"}`,
        `Médecin/Sage-femme : ${projet.medecin || "Non renseigné"}`,
        `Date prévue : ${projet.datePrevu || "Non renseigné"}`,
      ]);

      addSection("2. Lieu & ambiance", [
        `Type de salle : ${projet.typeSalle}`,
        `Lumière tamisée : ${boolLabel(projet.lumiereTamisee)}`,
        `Musique : ${boolLabel(projet.musique)}${projet.musiqueDetails ? ` (${projet.musiqueDetails})` : ""}`,
        `Accompagnants : ${projet.accompagnants || "Non précisé"}`,
      ]);

      addSection("3. Gestion de la douleur", [
        `Péridurale : ${projet.peridurale === "oui" ? "✅ Souhaitée" : projet.peridurale === "non" ? "❌ Non souhaitée" : "⚡ Selon le déroulement"}`,
        `Protoxyde d'azote : ${boolLabel(projet.protoxyde)}`,
        `Bain/douche de relaxation : ${boolLabel(projet.bain)}`,
        `Massage : ${boolLabel(projet.massage)}`,
        projet.autresDouleur ? `Autres : ${projet.autresDouleur}` : "",
      ].filter(Boolean) as string[]);

      addSection("4. Accouchement", [
        `Positions libres : ${boolLabel(projet.positionsLibres)}`,
        `Monitoring continu : ${boolLabel(projet.monitoringContinu)}`,
        `Rupture de la poche des eaux : ${projet.rupturePoche === "naturelle" ? "Naturelle" : projet.rupturePoche === "artificielle" ? "Artificielle acceptée" : "Selon les besoins"}`,
      ]);

      addSection("5. La naissance", [
        `Peau à peau immédiat : ${boolLabel(projet.peauPeau)}`,
        `Clampage du cordon différé : ${boolLabel(projet.clampageCordeDiffere)}`,
        `Papa/partenaire coupe le cordon : ${boolLabel(projet.pereCoupeCordon)}`,
      ]);

      addSection("6. Nouveau-né", [
        `Vitamine K : ${boolLabel(projet.vitamineK)}`,
        `Allaitement : ${projet.allaitement === "oui" ? "✅ Souhaité" : projet.allaitement === "non" ? "❌ Non souhaité" : "🤔 On essaie"}`,
        `Bain différé (après 24h) : ${boolLabel(projet.bainDiffere)}`,
      ]);

      addSection("7. Césarienne (si nécessaire)", [
        `Peau à peau au bloc : ${boolLabel(projet.cesariennePeauPeau)}`,
        `Partenaire présent : ${boolLabel(projet.cesariennePartenaire)}`,
        projet.cesarienneNotesLibres ? `Notes : ${projet.cesarienneNotesLibres}` : "",
      ].filter(Boolean) as string[]);

      if (projet.notes) {
        addSection("8. Notes libres", [projet.notes]);
      }

      // Footer
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i}/${total} — MamaTrack • Projet de naissance`, pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
      }

      doc.save(`mamatrack-projet-naissance.pdf`);
      notifyPartner("milestone", { milestone: "Projet de naissance finalisé" });
      setSuccess(true);
      toast.success("PDF téléchargé 🎉");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de générer le PDF, réessaye.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">🌸 Projet de naissance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prépare et partage tes souhaits</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportPDF}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
            success
              ? "bg-green-100 dark:bg-green-900/30 text-green-600"
              : "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
          } disabled:opacity-60`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}
          {success ? "Téléchargé !" : "PDF"}
        </motion.button>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => (
        <div key={section.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800"
          >
            <h2 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm">{section.title}</h2>
            {expandedSections.has(section.id) ? (
              <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.has(section.id) && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-0">
                  {section.id === 1 && (
                    <>
                      {(["mamanNom", "papaPartenaireNom", "maternite", "medecin"] as const).map((key, i) => (
                        <div key={key} className="py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                            {["Prénom de la maman", "Prénom du papa/partenaire", "Nom de la maternité", "Médecin/Sage-femme"][i]}
                          </label>
                          <input
                            type="text"
                            value={projet[key]}
                            onChange={e => update(key, e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                          />
                        </div>
                      ))}
                      <div className="py-2.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Date prévue d&apos;accouchement</label>
                        <input
                          type="date"
                          value={projet.datePrevu}
                          onChange={e => update("datePrevu", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                      </div>
                    </>
                  )}

                  {section.id === 2 && (
                    <>
                      <div className="py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Type de salle</label>
                        <select
                          value={projet.typeSalle}
                          onChange={e => update("typeSalle", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        >
                          <option>Salle classique</option>
                          <option>Salle nature/baignoire</option>
                          <option>Salle physio</option>
                        </select>
                      </div>
                      <BooleanField label="Lumière tamisée" value={projet.lumiereTamisee} onChange={v => update("lumiereTamisee", v)} />
                      <BooleanField label="Musique de mon choix" value={projet.musique} onChange={v => update("musique", v)} />
                      {projet.musique && (
                        <div className="py-2 border-b border-gray-100 dark:border-gray-800">
                          <input
                            placeholder="Playlist, genre musical..."
                            value={projet.musiqueDetails}
                            onChange={e => update("musiqueDetails", e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                          />
                        </div>
                      )}
                      <div className="py-2.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Accompagnants souhaités</label>
                        <input
                          placeholder="ex: conjoint, ma mère..."
                          value={projet.accompagnants}
                          onChange={e => update("accompagnants", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                      </div>
                    </>
                  )}

                  {section.id === 3 && (
                    <>
                      <RadioField
                        label="Péridurale"
                        value={projet.peridurale}
                        options={[
                          { value: "oui", label: "✅ Oui" },
                          { value: "non", label: "❌ Non" },
                          { value: "selon", label: "⚡ Selon le déroulement" },
                        ]}
                        onChange={v => update("peridurale", v as ProjetNaissance["peridurale"])}
                      />
                      <BooleanField label="Protoxyde d'azote (MEOPA)" value={projet.protoxyde} onChange={v => update("protoxyde", v)} />
                      <BooleanField label="Bain / douche de relaxation" value={projet.bain} onChange={v => update("bain", v)} />
                      <BooleanField label="Massage par le/la partenaire" value={projet.massage} onChange={v => update("massage", v)} />
                      <div className="py-2.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Autres demandes</label>
                        <textarea
                          value={projet.autresDouleur}
                          onChange={e => update("autresDouleur", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {section.id === 4 && (
                    <>
                      <BooleanField label="Liberté de positions" value={projet.positionsLibres} onChange={v => update("positionsLibres", v)} />
                      <BooleanField label="Monitoring continu (obligatoire)" value={projet.monitoringContinu} onChange={v => update("monitoringContinu", v)} />
                      <RadioField
                        label="Rupture de la poche des eaux"
                        value={projet.rupturePoche}
                        options={[
                          { value: "naturelle", label: "Naturelle" },
                          { value: "artificielle", label: "Artificielle si besoin" },
                          { value: "selon", label: "Selon les besoins" },
                        ]}
                        onChange={v => update("rupturePoche", v as ProjetNaissance["rupturePoche"])}
                      />
                    </>
                  )}

                  {section.id === 5 && (
                    <>
                      <BooleanField label="Peau à peau immédiat après naissance" value={projet.peauPeau} onChange={v => update("peauPeau", v)} />
                      <BooleanField label="Clampage du cordon différé" value={projet.clampageCordeDiffere} onChange={v => update("clampageCordeDiffere", v)} />
                      <BooleanField label="Papa/partenaire coupe le cordon" value={projet.pereCoupeCordon} onChange={v => update("pereCoupeCordon", v)} />
                    </>
                  )}

                  {section.id === 6 && (
                    <>
                      <BooleanField label="Vitamine K (injection préventive)" value={projet.vitamineK} onChange={v => update("vitamineK", v)} />
                      <RadioField
                        label="Allaitement"
                        value={projet.allaitement}
                        options={[
                          { value: "oui", label: "✅ Souhaité" },
                          { value: "non", label: "❌ Non" },
                          { value: "essayer", label: "🤔 On essaie" },
                        ]}
                        onChange={v => update("allaitement", v as ProjetNaissance["allaitement"])}
                      />
                      <BooleanField label="Premier bain différé (après 24h)" value={projet.bainDiffere} onChange={v => update("bainDiffere", v)} />
                    </>
                  )}

                  {section.id === 7 && (
                    <>
                      <BooleanField label="Peau à peau au bloc opératoire" value={projet.cesariennePeauPeau} onChange={v => update("cesariennePeauPeau", v)} />
                      <BooleanField label="Partenaire présent(e) au bloc" value={projet.cesariennePartenaire} onChange={v => update("cesariennePartenaire", v)} />
                      <div className="py-2.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Notes spécifiques</label>
                        <textarea
                          value={projet.cesarienneNotesLibres}
                          onChange={e => update("cesarienneNotesLibres", e.target.value)}
                          rows={2}
                          placeholder="Vos souhaits spécifiques..."
                          className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {section.id === 8 && (
                    <div className="py-2.5">
                      <textarea
                        value={projet.notes}
                        onChange={e => update("notes", e.target.value)}
                        rows={5}
                        placeholder="Toutes vos remarques, questions, souhaits particuliers..."
                        className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Export button bottom */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportPDF}
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <CheckCircle2 className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
        {success ? "PDF téléchargé ! 🎉" : "Exporter le projet de naissance en PDF"}
      </motion.button>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
        📄 Le PDF sera lisible par votre maternité et votre équipe médicale
      </p>
    </div>
  );
}
