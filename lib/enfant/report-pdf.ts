import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatMinutes, type MonthlyReport } from "./report-data";

const BRAND_COLOR: [number, number, number] = [236, 72, 153]; // pink-500
const TEXT_COLOR: [number, number, number] = [17, 24, 39]; // slate-900
const MUTED: [number, number, number] = [100, 116, 139]; // slate-500

export function buildMonthlyReportPdf(report: MonthlyReport): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MamaTrack", margin, 38);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Rapport mensuel", margin, 56);
  doc.setFontSize(11);
  doc.text(
    capitalize(report.range.label),
    pageWidth - margin,
    38,
    { align: "right" },
  );
  doc.setFontSize(9);
  doc.text(
    `Édité le ${new Date().toLocaleDateString("fr-FR")}`,
    pageWidth - margin,
    56,
    { align: "right" },
  );

  y = 110;

  // Baby block
  doc.setTextColor(...TEXT_COLOR);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(report.baby.name, margin, y);
  y += 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  const ageMonths = monthsBetween(
    report.baby.birth_date,
    new Date(report.range.endExclusiveIso),
  );
  doc.text(
    `Né(e) le ${formatDate(report.baby.birth_date)} · ${ageMonths} mois à la fin de la période`,
    margin,
    y,
  );
  y += 24;

  // Stats grid: 2 colonnes
  const colWidth = (pageWidth - margin * 2 - 16) / 2;

  drawStatCard(doc, margin, y, colWidth, "🍼 Alimentation", [
    [`${report.feedings.total}`, "repas / mois"],
    [`${report.feedings.avgPerDay}`, "/ jour en moyenne"],
    [`${report.feedings.bottles} biberons`, `${report.feedings.totalAmountMl} ml total`],
    [`${report.feedings.breast} tétées`, `${report.feedings.solids} solides`],
  ]);
  drawStatCard(doc, margin + colWidth + 16, y, colWidth, "😴 Sommeil", [
    [`${formatMinutes(report.sleeps.totalMinutes)}`, "total"],
    [`${formatMinutes(report.sleeps.avgMinutesPerDay)}`, "/ jour en moyenne"],
    [`${report.sleeps.naps} siestes`, `${report.sleeps.nights} nuits`],
    [`${formatMinutes(report.sleeps.longestMinutes)}`, "plus long sommeil"],
  ]);

  y += 110;

  drawStatCard(doc, margin, y, colWidth, "💩 Couches", [
    [`${report.diapers.total}`, "couches / mois"],
    [`${report.diapers.avgPerDay}`, "/ jour en moyenne"],
    [`${report.diapers.wet} mouillées`, `${report.diapers.dirty} sales`],
    [`${report.diapers.mixed} mixtes`, ``],
  ]);

  drawStatCard(doc, margin + colWidth + 16, y, colWidth, "🌡️ Santé", [
    [`${report.health.fevers} fièvres`, ""],
    [`${report.health.medicines} médicaments`, ""],
    [`${report.health.appointments} RDV pédiatre`, ""],
    [`${report.health.symptoms} symptômes`, ""],
  ]);

  y += 120;

  // Croissance
  if (report.growth.measurements > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_COLOR);
    doc.text("📏 Croissance", margin, y);
    y += 14;
    const rows: (string | number)[][] = [];
    if (report.growth.firstWeightG !== null && report.growth.lastWeightG !== null) {
      rows.push([
        "Poids",
        `${(report.growth.firstWeightG / 1000).toFixed(2)} kg`,
        `${(report.growth.lastWeightG / 1000).toFixed(2)} kg`,
        deltaWeightLabel(report.growth.deltaWeightG),
      ]);
    }
    if (
      report.growth.firstHeightCm !== null &&
      report.growth.lastHeightCm !== null
    ) {
      rows.push([
        "Taille",
        `${report.growth.firstHeightCm} cm`,
        `${report.growth.lastHeightCm} cm`,
        deltaHeightLabel(report.growth.deltaHeightCm),
      ]);
    }
    if (rows.length === 0) {
      rows.push([
        `${report.growth.measurements} mesure(s) ce mois`,
        "",
        "",
        "",
      ]);
    }
    autoTable(doc, {
      startY: y,
      head: [["Mesure", "Début", "Fin", "Évolution"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: BRAND_COLOR, textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    // @ts-expect-error autoTable injects lastAutoTable on doc
    y = doc.lastAutoTable.finalY + 20;
  }

  // Vaccins
  if (report.vaccines.length > 0) {
    y = ensurePage(doc, y, 60, margin);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("💉 Vaccins effectués", margin, y);
    y += 6;
    autoTable(doc, {
      startY: y + 4,
      head: [["Date", "Vaccin"]],
      body: report.vaccines.map((v) => [
        formatDate(v.given_at),
        v.label ?? v.code,
      ]),
      theme: "grid",
      headStyles: { fillColor: BRAND_COLOR, textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    // @ts-expect-error autoTable injects lastAutoTable on doc
    y = doc.lastAutoTable.finalY + 20;
  }

  // Milestones
  if (report.milestones.length > 0) {
    y = ensurePage(doc, y, 60, margin);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("🏆 Étapes franchies", margin, y);
    y += 6;
    autoTable(doc, {
      startY: y + 4,
      head: [["Date", "Étape"]],
      body: report.milestones.map((m) => [
        formatDate(m.achieved_at),
        m.label ?? m.code,
      ]),
      theme: "grid",
      headStyles: { fillColor: BRAND_COLOR, textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    // @ts-expect-error autoTable injects lastAutoTable on doc
    y = doc.lastAutoTable.finalY + 20;
  }

  // Diary
  if (report.diary.count > 0) {
    y = ensurePage(doc, y, 50, margin);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📸 Journal", margin, y);
    y += 16;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(
      `${report.diary.count} entrée(s) — ${report.diary.withPhoto} avec photo.`,
      margin,
      y,
    );
    y += 16;
  }

  // Footer
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `MamaTrack · Rapport généré automatiquement · Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 16,
      { align: "center" },
    );
  }

  const arr = doc.output("arraybuffer");
  return Buffer.from(arr);
}

function drawStatCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  rows: [string, string][],
) {
  const h = 100;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(x, y, w, h, 6, 6, "FD");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_COLOR);
  doc.text(title, x + 12, y + 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let ry = y + 36;
  for (const [primary, secondary] of rows) {
    doc.setTextColor(...TEXT_COLOR);
    doc.text(primary, x + 12, ry);
    if (secondary) {
      doc.setTextColor(...MUTED);
      doc.text(secondary, x + w - 12, ry, { align: "right" });
    }
    ry += 14;
  }
}

function ensurePage(doc: jsPDF, y: number, needed: number, margin: number): number {
  const ph = doc.internal.pageSize.getHeight();
  if (y + needed > ph - margin) {
    doc.addPage();
    return margin + 10;
  }
  return y;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function deltaWeightLabel(g: number | null): string {
  if (g === null) return "—";
  const sign = g >= 0 ? "+" : "";
  return `${sign}${(g / 1000).toFixed(2)} kg`;
}

function deltaHeightLabel(cm: number | null): string {
  if (cm === null) return "—";
  const sign = cm >= 0 ? "+" : "";
  return `${sign}${cm} cm`;
}

function monthsBetween(birthIso: string, ref: Date): number {
  const b = new Date(birthIso);
  const days = Math.floor((ref.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.floor(days / 30.44));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
