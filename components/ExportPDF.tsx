"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { FileDown, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type jsPDFType from "jspdf";
import { getCurrentWeek, getDaysRemaining, getWeekData } from "@/lib/pregnancy-data";

export default function ExportPDF() {
  const store = useStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFillColor(244, 114, 182); // Pink
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("MamaTrack", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Rapport de suivi de grossesse", pageWidth / 2, 30, { align: "center" });

      yPos = 55;
      doc.setTextColor(0, 0, 0);

      // Date du rapport
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Généré le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Informations générales
      if (store.dueDate) {
        const dueDate = new Date(store.dueDate);
        const week = getCurrentWeek(dueDate);
        const days = getDaysRemaining(dueDate);
        const weekData = getWeekData(week);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Informations générales", 14, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Date prévue d'accouchement : ${format(dueDate, "d MMMM yyyy", { locale: fr })}`, 14, yPos);
        yPos += 6;
        doc.text(`Semaine de grossesse : ${week} SA`, 14, yPos);
        yPos += 6;
        doc.text(`Jours restants : ${days}`, 14, yPos);
        yPos += 6;
        doc.text(`Trimestre : ${weekData.trimester}${weekData.trimester === 1 ? 'er' : 'ème'}`, 14, yPos);
        yPos += 6;
        doc.text(`Taille bébé : ${weekData.sizeMm >= 100 ? `${(weekData.sizeMm / 10).toFixed(0)} cm` : `${weekData.sizeMm} mm`}`, 14, yPos);
        yPos += 6;
        doc.text(`Poids bébé : ${weekData.weightG >= 1000 ? `${(weekData.weightG / 1000).toFixed(1)} kg` : `${weekData.weightG} g`}`, 14, yPos);
        yPos += 15;
      }

      // Suivi du poids
      if (store.weightEntries.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Suivi du poids", 14, yPos);
        yPos += 5;

        const weightData = store.weightEntries
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(entry => [
            format(new Date(entry.date), "dd/MM/yyyy"),
            `${entry.weight} kg`,
            entry.note || "-"
          ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Poids", "Note"]],
          body: weightData,
          theme: 'striped',
          headStyles: { fillColor: [244, 114, 182] },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Rendez-vous médicaux
      if (store.appointments.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Rendez-vous médicaux", 14, yPos);
        yPos += 5;

        const apptData = store.appointments
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(appt => [
            format(new Date(appt.date), "dd/MM/yyyy"),
            appt.time,
            appt.title,
            appt.doctor || "-",
            appt.done ? "✓" : "-"
          ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Heure", "Titre", "Médecin", "Fait"]],
          body: apptData,
          theme: 'striped',
          headStyles: { fillColor: [244, 114, 182] },
          margin: { left: 14, right: 14 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            4: { cellWidth: 15 },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Contractions
      if (store.contractionSessions.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Sessions de contractions", 14, yPos);
        yPos += 5;

        const contractionData = store.contractionSessions
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(session => {
            const avgDuration = session.contractions.length > 0
              ? Math.round(session.contractions.reduce((acc, c) => acc + (c.duration || 0), 0) / session.contractions.length)
              : 0;
            const avgInterval = session.contractions.length > 1
              ? Math.round(session.contractions.slice(1).reduce((acc, c) => acc + (c.interval || 0), 0) / (session.contractions.length - 1))
              : 0;
            
            return [
              format(new Date(session.date), "dd/MM/yyyy"),
              session.contractions.length.toString(),
              avgDuration > 0 ? `${avgDuration}s` : "-",
              avgInterval > 0 ? `${Math.round(avgInterval / 60)}min` : "-"
            ];
          });

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Nombre", "Durée moy.", "Intervalle moy."]],
          body: contractionData,
          theme: 'striped',
          headStyles: { fillColor: [244, 114, 182] },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Checklist progress
      const doneCount = store.checklistItems.filter(i => i.done).length;
      const totalCount = store.checklistItems.length;
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Checklist de préparation", 14, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Progression : ${doneCount}/${totalCount} (${Math.round((doneCount / totalCount) * 100)}%)`, 14, yPos);
      yPos += 10;

      // Progress bar
      doc.setFillColor(252, 231, 243); // Light pink
      doc.roundedRect(14, yPos, pageWidth - 28, 8, 4, 4, 'F');
      doc.setFillColor(244, 114, 182); // Pink
      const progressWidth = ((doneCount / totalCount) * (pageWidth - 28));
      if (progressWidth > 0) {
        doc.roundedRect(14, yPos, progressWidth, 8, 4, 4, 'F');
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} sur ${totalPages} - MamaTrack`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save PDF
      const fileName = `mamatrack-rapport-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={generatePDF}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
        success
          ? "bg-green-100 dark:bg-green-900/30 text-green-600"
          : "bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-500 hover:to-purple-500"
      } disabled:opacity-60`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Génération...
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          PDF téléchargé !
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Exporter PDF
        </>
      )}
    </motion.button>
  );
}
