"use client";

import { useState } from "react";
import { m as motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { BookMarked, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type jsPDFType from "jspdf";

const PAGE_MARGIN = 15;
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const CONTENT_WIDTH = A4_WIDTH - PAGE_MARGIN * 2;
const HEADER_HEIGHT = 18;
const FOOTER_HEIGHT = 12;

const INK = { r: 30, g: 30, b: 30 };
const RULE = { r: 70, g: 70, b: 70 };
const MUTED = { r: 110, g: 110, b: 110 };
const ACCENT = { r: 80, g: 60, b: 120 };

type Doc = jsPDFType;

function setText(doc: Doc, color: { r: number; g: number; b: number }) {
  doc.setTextColor(color.r, color.g, color.b);
}
function setDraw(doc: Doc, color: { r: number; g: number; b: number }) {
  doc.setDrawColor(color.r, color.g, color.b);
}
function setFill(doc: Doc, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
}

function drawHeader(doc: Doc, dueDateLabel: string) {
  setText(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MamaTrack — Carnet de maternité", PAGE_MARGIN, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, MUTED);
  doc.text(`DPA : ${dueDateLabel}`, A4_WIDTH - PAGE_MARGIN, 10, { align: "right" });

  setDraw(doc, RULE);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, HEADER_HEIGHT - 4, A4_WIDTH - PAGE_MARGIN, HEADER_HEIGHT - 4);
  setText(doc, INK);
}

function drawFooter(doc: Doc, page: number, total: number) {
  setDraw(doc, RULE);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, A4_HEIGHT - FOOTER_HEIGHT, A4_WIDTH - PAGE_MARGIN, A4_HEIGHT - FOOTER_HEIGHT);

  setText(doc, MUTED);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    "Document personnel — non-substitutif d'un dossier médical officiel",
    PAGE_MARGIN,
    A4_HEIGHT - FOOTER_HEIGHT + 5,
  );
  doc.setFont("helvetica", "normal");
  doc.text(`Page ${page} / ${total}`, A4_WIDTH - PAGE_MARGIN, A4_HEIGHT - FOOTER_HEIGHT + 5, {
    align: "right",
  });
  setText(doc, INK);
}

function sectionTitle(doc: Doc, title: string, y: number): number {
  setText(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, PAGE_MARGIN, y);

  setDraw(doc, ACCENT);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, y + 2, A4_WIDTH - PAGE_MARGIN, y + 2);

  setText(doc, INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  return y + 9;
}

function fieldLine(doc: Doc, label: string, value: string, x: number, y: number, width: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  const labelWidth = doc.getTextWidth(label) + 2;

  setDraw(doc, RULE);
  doc.setLineWidth(0.2);
  doc.line(x + labelWidth, y + 1, x + width, y + 1);

  if (value) {
    doc.setFontSize(10);
    doc.text(value, x + labelWidth + 1, y);
  }
  return y + 7;
}

function signatureBox(doc: Doc, x: number, y: number, w = 60, h = 22): void {
  setDraw(doc, RULE);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h);
  setText(doc, MUTED);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text("Cachet et signature professionnel", x + w / 2, y + h + 3, { align: "center" });
  setText(doc, INK);
  doc.setFont("helvetica", "normal");
}

function ensureSpace(
  doc: Doc,
  y: number,
  needed: number,
  pageState: { current: number; total: number },
  dueLabel: string,
): number {
  const limit = A4_HEIGHT - FOOTER_HEIGHT - 5;
  if (y + needed > limit) {
    doc.addPage();
    pageState.current += 1;
    drawHeader(doc, dueLabel);
    return HEADER_HEIGHT + 4;
  }
  return y;
}

export default function CarnetMaternite() {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" }) as Doc;

      const dueDate = store.dueDate ? new Date(store.dueDate) : null;
      const dueLabel = dueDate ? format(dueDate, "d MMMM yyyy", { locale: fr }) : "à compléter";
      const pageState = { current: 1, total: 1 };

      drawHeader(doc, dueLabel);

      // ============ PAGE 1 — PAGE DE GARDE ============
      let y = HEADER_HEIGHT + 12;

      setText(doc, ACCENT);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Carnet de maternité", A4_WIDTH / 2, y, { align: "center" });
      y += 8;

      setText(doc, MUTED);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.text("Suivi personnel de grossesse", A4_WIDTH / 2, y, { align: "center" });
      y += 16;

      setText(doc, INK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const colWidth = CONTENT_WIDTH;
      y = fieldLine(doc, "Prénom de la maman :", store.mamaName ?? "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Nom :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Date de naissance :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Numéro de sécurité sociale :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Numéro de dossier maternité :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y += 4;

      y = fieldLine(doc, "Prénom du bébé :", store.babyName ?? "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(
        doc,
        "Date prévue d'accouchement (DPA) :",
        dueDate ? format(dueDate, "d MMMM yyyy", { locale: fr }) : "",
        PAGE_MARGIN,
        y,
        PAGE_MARGIN + colWidth,
      );
      y = fieldLine(doc, "Maternité prévue :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y += 6;

      y = sectionTitle(doc, "Professionnels qui suivent la grossesse", y);
      y = fieldLine(doc, "Médecin / Gynécologue :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Sage-femme :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Cabinet / Adresse :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y = fieldLine(doc, "Téléphone :", "", PAGE_MARGIN, y, PAGE_MARGIN + colWidth);
      y += 6;

      y = sectionTitle(doc, "Antécédents et informations utiles", y);
      const blockH = 38;
      setDraw(doc, RULE);
      doc.setLineWidth(0.2);
      for (let i = 0; i < 5; i++) {
        const ly = y + 6 + i * 7;
        doc.line(PAGE_MARGIN, ly, A4_WIDTH - PAGE_MARGIN, ly);
      }
      y += blockH;

      setText(doc, MUTED);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(
        `Document généré le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })} via MamaTrack`,
        A4_WIDTH / 2,
        A4_HEIGHT - FOOTER_HEIGHT - 8,
        { align: "center" },
      );
      setText(doc, INK);

      // ============ PAGE 2 — SUIVI MENSUEL ============
      doc.addPage();
      pageState.current += 1;
      drawHeader(doc, dueLabel);
      y = HEADER_HEIGHT + 6;
      y = sectionTitle(doc, "1. Suivi mensuel — M1 à M9", y);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      setText(doc, MUTED);
      doc.text(
        "Une ligne par mois. Pré-remplie depuis vos données. Le professionnel signe la case de droite.",
        PAGE_MARGIN,
        y,
      );
      setText(doc, INK);
      doc.setFont("helvetica", "normal");
      y += 5;

      const sortedAppts = [...store.appointments].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const sortedWeights = [...store.weightEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const sortedBP = [...store.bloodPressureEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const sortedAbdomen = [...store.abdomenMeasurements].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      const monthRows: string[][] = [];
      for (let m = 1; m <= 9; m++) {
        const appt = sortedAppts[m - 1];
        const weight = sortedWeights[m - 1];
        const bp = sortedBP[m - 1];
        const abd = sortedAbdomen[m - 1];

        monthRows.push([
          `M${m}`,
          appt ? format(new Date(appt.date), "dd/MM/yyyy") : "",
          weight ? `${weight.weight} kg` : "",
          bp ? `${bp.systolic}/${bp.diastolic}` : "",
          abd ? `${abd.circumferenceCm} cm` : "",
          "",
          appt?.notes || appt?.title || "",
        ]);
      }

      autoTable(doc, {
        startY: y,
        head: [["Mois", "Date RDV", "Poids", "TA", "Hauteur ut.", "BDC", "Notes"]],
        body: monthRows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2.5, textColor: [INK.r, INK.g, INK.b], lineColor: [RULE.r, RULE.g, RULE.b] },
        headStyles: {
          fillColor: [240, 235, 250],
          textColor: [ACCENT.r, ACCENT.g, ACCENT.b],
          fontStyle: "bold",
          lineColor: [RULE.r, RULE.g, RULE.b],
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN + 35 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 22 },
          2: { cellWidth: 18 },
          3: { cellWidth: 18 },
          4: { cellWidth: 22 },
          5: { cellWidth: 18 },
          6: { cellWidth: "auto" },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 6) {
            const x = data.cell.x + data.cell.width + 2;
            const cellY = data.cell.y + 1;
            const w = 30;
            const h = data.cell.height - 2;
            setDraw(doc, RULE);
            doc.setLineWidth(0.2);
            doc.rect(x, cellY, w, h);
          }
        },
        didDrawPage: () => {
          setText(doc, MUTED);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7);
          doc.text("Signature", A4_WIDTH - PAGE_MARGIN - 17, y - 1, { align: "center" });
          setText(doc, INK);
          doc.setFont("helvetica", "normal");
        },
      });

      const lastTable1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
      y = lastTable1.finalY + 8;

      // ============ EXAMENS PRESCRITS ============
      y = ensureSpace(doc, y, 90, pageState, dueLabel);
      y = sectionTitle(doc, "2. Examens prescrits", y);

      const examRows = [
        ["Échographie 1er trimestre (11-13 SA)", "", ""],
        ["Échographie 2ème trimestre (20-25 SA)", "", ""],
        ["Échographie 3ème trimestre (32-34 SA)", "", ""],
        ["Prise de sang 1er trimestre", "", ""],
        ["Marqueurs sériques (T21)", "", ""],
        ["Glycémie à jeun", "", ""],
        ["HGPO (test O'Sullivan / 75g)", "", ""],
        ["Streptocoque B (35-38 SA)", "", ""],
        ["NFS / Plaquettes (3ème trimestre)", "", ""],
        ["RAI (recherche d'agglutinines)", "", ""],
        ["Frottis cervico-utérin", "", ""],
        ["Bilan dentaire (remboursé)", "", ""],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Examen", "Date réalisée", "Résultat / Observation"]],
        body: examRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: [INK.r, INK.g, INK.b], lineColor: [RULE.r, RULE.g, RULE.b], minCellHeight: 7 },
        headStyles: {
          fillColor: [240, 235, 250],
          textColor: [ACCENT.r, ACCENT.g, ACCENT.b],
          fontStyle: "bold",
          lineColor: [RULE.r, RULE.g, RULE.b],
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 32 },
          2: { cellWidth: "auto" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ============ VACCINATIONS & SÉROLOGIES ============
      y = ensureSpace(doc, y, 90, pageState, dueLabel);
      y = sectionTitle(doc, "3. Vaccinations et sérologies", y);

      const seroRows = [
        ["Toxoplasmose", "", "", ""],
        ["Rubéole", "", "", ""],
        ["CMV (cytomégalovirus)", "", "", ""],
        ["Hépatite B (Ag HBs)", "", "", ""],
        ["Syphilis (TPHA-VDRL)", "", "", ""],
        ["VIH", "", "", ""],
        ["Vaccin COVID-19", "", "", ""],
        ["Vaccin grippe saisonnière", "", "", ""],
        ["Vaccin coqueluche (dTcaP)", "", "", ""],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Élément", "Statut", "Date", "Résultat"]],
        body: seroRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: [INK.r, INK.g, INK.b], lineColor: [RULE.r, RULE.g, RULE.b], minCellHeight: 7 },
        headStyles: {
          fillColor: [240, 235, 250],
          textColor: [ACCENT.r, ACCENT.g, ACCENT.b],
          fontStyle: "bold",
          lineColor: [RULE.r, RULE.g, RULE.b],
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: "auto" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ============ COURBES (nouvelle page) ============
      doc.addPage();
      pageState.current += 1;
      drawHeader(doc, dueLabel);
      y = HEADER_HEIGHT + 6;
      y = sectionTitle(doc, "4. Courbes de suivi", y);

      // Weight curve
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Courbe de poids", PAGE_MARGIN, y);
      y += 4;

      const chartX = PAGE_MARGIN;
      const chartY = y;
      const chartW = CONTENT_WIDTH;
      const chartH = 70;

      setDraw(doc, RULE);
      doc.setLineWidth(0.3);
      doc.rect(chartX, chartY, chartW, chartH);

      const allWeights = sortedWeights.map((w) => w.weight);
      const minKg = allWeights.length ? Math.min(...allWeights) - 2 : 50;
      const maxKg = allWeights.length ? Math.max(...allWeights) + 2 : 90;
      const rangeKg = Math.max(1, maxKg - minKg);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      setText(doc, MUTED);
      for (let i = 0; i <= 4; i++) {
        const v = maxKg - (i * rangeKg) / 4;
        const ly = chartY + (i * chartH) / 4;
        setDraw(doc, { r: 220, g: 220, b: 220 });
        doc.setLineWidth(0.1);
        if (i > 0 && i < 4) doc.line(chartX, ly, chartX + chartW, ly);
        doc.text(`${v.toFixed(1)} kg`, chartX - 1, ly + 1.5, { align: "right" });
      }

      // IOM-style guide bands (normal-BMI gain ranges roughly)
      setDraw(doc, { r: 180, g: 200, b: 180 });
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([1, 1], 0);
      const baseY = chartY + chartH - 2;
      const baseKg = allWeights.length ? allWeights[0] : minKg + 2;
      const guidePoints = [
        { week: 0, kgGain: 0 },
        { week: 13, kgGain: 1.5 },
        { week: 28, kgGain: 7 },
        { week: 40, kgGain: 12.5 },
      ];
      const xForWeek = (w: number) => chartX + (w / 40) * chartW;
      const yForKg = (kg: number) => chartY + chartH - ((kg - minKg) / rangeKg) * chartH;
      for (let i = 0; i < guidePoints.length - 1; i++) {
        const a = guidePoints[i];
        const b = guidePoints[i + 1];
        doc.line(xForWeek(a.week), yForKg(baseKg + a.kgGain), xForWeek(b.week), yForKg(baseKg + b.kgGain));
      }
      doc.setLineDashPattern([], 0);

      setText(doc, INK);
      if (sortedWeights.length >= 2 && store.dueDate) {
        const due = new Date(store.dueDate).getTime();
        const fortyMs = 40 * 7 * 24 * 60 * 60 * 1000;
        const startMs = due - fortyMs;
        setDraw(doc, ACCENT);
        doc.setLineWidth(0.5);
        let prevX = 0;
        let prevY = 0;
        sortedWeights.forEach((w, idx) => {
          const t = new Date(w.date).getTime();
          const weekNum = Math.max(0, Math.min(40, ((t - startMs) / fortyMs) * 40));
          const px = xForWeek(weekNum);
          const py = yForKg(w.weight);
          if (idx > 0) doc.line(prevX, prevY, px, py);
          setFill(doc, ACCENT);
          doc.circle(px, py, 0.7, "F");
          prevX = px;
          prevY = py;
        });
      } else {
        setText(doc, MUTED);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(
          "Aucune mesure de poids enregistrée — la courbe se remplira automatiquement.",
          chartX + chartW / 2,
          chartY + chartH / 2,
          { align: "center" },
        );
        setText(doc, INK);
        doc.setFont("helvetica", "normal");
      }

      doc.setFontSize(7);
      setText(doc, MUTED);
      doc.text("SA 0", chartX, chartY + chartH + 4);
      doc.text("SA 20", chartX + chartW / 2, chartY + chartH + 4, { align: "center" });
      doc.text("SA 40", chartX + chartW, chartY + chartH + 4, { align: "right" });
      doc.text(
        "Référence : recommandations IOM — prise de poids 11,5–16 kg pour IMC normal.",
        chartX,
        chartY + chartH + 8,
      );
      setText(doc, INK);
      y = chartY + chartH + 14;

      // Tension curve
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Courbe de tension artérielle", PAGE_MARGIN, y);
      y += 4;

      const taY = y;
      const taH = 60;
      setDraw(doc, RULE);
      doc.setLineWidth(0.3);
      doc.rect(chartX, taY, chartW, taH);

      const allSys = sortedBP.map((b) => b.systolic);
      const allDia = sortedBP.map((b) => b.diastolic);
      const minMm = sortedBP.length ? Math.min(...allDia) - 10 : 50;
      const maxMm = sortedBP.length ? Math.max(...allSys) + 10 : 160;
      const rangeMm = Math.max(1, maxMm - minMm);

      doc.setFontSize(7);
      setText(doc, MUTED);
      for (let i = 0; i <= 4; i++) {
        const v = maxMm - (i * rangeMm) / 4;
        const ly = taY + (i * taH) / 4;
        setDraw(doc, { r: 220, g: 220, b: 220 });
        doc.setLineWidth(0.1);
        if (i > 0 && i < 4) doc.line(chartX, ly, chartX + chartW, ly);
        doc.text(`${v.toFixed(0)}`, chartX - 1, ly + 1.5, { align: "right" });
      }

      setDraw(doc, { r: 200, g: 100, b: 100 });
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([1, 1], 0);
      const taThreshold = taY + taH - ((140 - minMm) / rangeMm) * taH;
      if (taThreshold >= taY && taThreshold <= taY + taH) {
        doc.line(chartX, taThreshold, chartX + chartW, taThreshold);
      }
      doc.setLineDashPattern([], 0);
      setText(doc, INK);

      if (sortedBP.length >= 1 && store.dueDate) {
        const due = new Date(store.dueDate).getTime();
        const fortyMs = 40 * 7 * 24 * 60 * 60 * 1000;
        const startMs = due - fortyMs;
        const xFor = (t: number) =>
          chartX + Math.max(0, Math.min(1, (t - startMs) / fortyMs)) * chartW;
        const yForMm = (m: number) => taY + taH - ((m - minMm) / rangeMm) * taH;

        let prevSysX = 0;
        let prevSysY = 0;
        let prevDiaX = 0;
        let prevDiaY = 0;
        sortedBP.forEach((bp, idx) => {
          const t = new Date(bp.date).getTime();
          const px = xFor(t);
          const sy = yForMm(bp.systolic);
          const dy = yForMm(bp.diastolic);
          setDraw(doc, ACCENT);
          doc.setLineWidth(0.5);
          if (idx > 0) doc.line(prevSysX, prevSysY, px, sy);
          setFill(doc, ACCENT);
          doc.circle(px, sy, 0.7, "F");

          setDraw(doc, { r: 100, g: 130, b: 200 });
          if (idx > 0) doc.line(prevDiaX, prevDiaY, px, dy);
          setFill(doc, { r: 100, g: 130, b: 200 });
          doc.circle(px, dy, 0.7, "F");
          prevSysX = px;
          prevSysY = sy;
          prevDiaX = px;
          prevDiaY = dy;
        });
      } else {
        setText(doc, MUTED);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(
          "Aucune mesure de tension enregistrée — la courbe se remplira automatiquement.",
          chartX + chartW / 2,
          taY + taH / 2,
          { align: "center" },
        );
        setText(doc, INK);
        doc.setFont("helvetica", "normal");
      }

      doc.setFontSize(7);
      setText(doc, MUTED);
      doc.text(
        "Systolique (violet) / Diastolique (bleu) — seuil HTA 140/90 mmHg en pointillé.",
        chartX,
        taY + taH + 5,
      );
      setText(doc, INK);
      y = taY + taH + 12;

      // ============ PRÉPARATION À L'ACCOUCHEMENT ============
      y = ensureSpace(doc, y, 70, pageState, dueLabel);
      y = sectionTitle(doc, "5. Préparation à l'accouchement", y);

      const prepRows: string[][] = (store.exerciseSessions ?? []).slice(0, 8).map((s) => [
        format(new Date(s.date), "dd/MM/yyyy"),
        s.activity,
        `${s.durationMin} min`,
        "",
      ]);
      while (prepRows.length < 6) prepRows.push(["", "", "", ""]);

      autoTable(doc, {
        startY: y,
        head: [["Date", "Type de séance", "Durée", "Animateur"]],
        body: prepRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: [INK.r, INK.g, INK.b], lineColor: [RULE.r, RULE.g, RULE.b], minCellHeight: 7 },
        headStyles: {
          fillColor: [240, 235, 250],
          textColor: [ACCENT.r, ACCENT.g, ACCENT.b],
          fontStyle: "bold",
          lineColor: [RULE.r, RULE.g, RULE.b],
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 70 },
          2: { cellWidth: 22 },
          3: { cellWidth: "auto" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ============ PLAN DE NAISSANCE ============
      y = ensureSpace(doc, y, 80, pageState, dueLabel);
      y = sectionTitle(doc, "6. Plan de naissance / souhaits", y);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      setText(doc, MUTED);
      doc.text("Espace libre : préférences, accompagnant·e, ambiance, péridurale, peau-à-peau…", PAGE_MARGIN, y);
      setText(doc, INK);
      doc.setFont("helvetica", "normal");
      y += 4;

      setDraw(doc, RULE);
      doc.setLineWidth(0.2);
      const planLines = 10;
      for (let i = 0; i < planLines; i++) {
        const ly = y + i * 6;
        doc.line(PAGE_MARGIN, ly, A4_WIDTH - PAGE_MARGIN, ly);
      }
      y += planLines * 6 + 4;

      // ============ COORDONNÉES ============
      y = ensureSpace(doc, y, 80, pageState, dueLabel);
      y = sectionTitle(doc, "7. Coordonnées et numéros utiles", y);

      const contacts = store.emergencyContacts ?? [];
      const contactRows: string[][] = contacts.length
        ? contacts.map((c) => [c.role || "—", c.name || "", c.phone || ""])
        : [];

      const defaults: { label: string; phone: string }[] = [
        { label: "Sage-femme référente", phone: "" },
        { label: "Gynécologue / Médecin", phone: "" },
        { label: "Maternité", phone: "" },
        { label: "SAMU", phone: "15" },
        { label: "Police-secours", phone: "17" },
        { label: "Pompiers", phone: "18" },
        { label: "Numéro européen d'urgence", phone: "112" },
        { label: "Centre antipoison", phone: "" },
      ];
      defaults.forEach((d) => {
        const already = contactRows.some((r) => r[0].toLowerCase() === d.label.toLowerCase());
        if (!already) contactRows.push([d.label, "", d.phone]);
      });

      autoTable(doc, {
        startY: y,
        head: [["Rôle", "Nom", "Téléphone"]],
        body: contactRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2.5, textColor: [INK.r, INK.g, INK.b], lineColor: [RULE.r, RULE.g, RULE.b], minCellHeight: 7 },
        headStyles: {
          fillColor: [240, 235, 250],
          textColor: [ACCENT.r, ACCENT.g, ACCENT.b],
          fontStyle: "bold",
          lineColor: [RULE.r, RULE.g, RULE.b],
        },
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 70 },
          2: { cellWidth: "auto" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      // Final signature box
      y = ensureSpace(doc, y, 40, pageState, dueLabel);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Signature finale du professionnel suivant la grossesse", PAGE_MARGIN, y);
      y += 4;
      signatureBox(doc, PAGE_MARGIN, y, 80, 25);

      // ============ FOOTERS ============
      pageState.total = doc.getNumberOfPages();
      for (let p = 1; p <= pageState.total; p++) {
        doc.setPage(p);
        drawFooter(doc, p, pageState.total);
      }

      const fileName = `mamatrack-carnet-maternite-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Carnet de maternité PDF error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={generate}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all border ${
        success
          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
      } disabled:opacity-60`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Génération du carnet...
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Carnet téléchargé !
        </>
      ) : (
        <>
          <BookMarked className="w-4 h-4" />
          Carnet de maternité (PDF)
        </>
      )}
    </motion.button>
  );
}
