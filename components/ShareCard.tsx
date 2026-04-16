"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getDaysRemaining, getWeekData } from "@/lib/pregnancy-data";
import SocialShareButtons from "@/components/SocialShareButtons";

const cardThemes = [
  {
    id: "rose",
    label: "Rose",
    swatch: "bg-gradient-to-br from-pink-400 to-rose-500",
    gradient: ["#fce7f3", "#ede9fe", "#ddd6fe"],
    circle1: "#f472b6",
    circle2: "#a78bfa",
    accent: "#db2777",
    secondary: "#7c3aed",
    previewBg: "from-pink-100 to-purple-100",
    previewAccent: "text-pink-600",
    previewSecondary: "text-purple-600",
  },
  {
    id: "lavande",
    label: "Lavande",
    swatch: "bg-gradient-to-br from-purple-400 to-violet-500",
    gradient: ["#ede9fe", "#e0e7ff", "#ddd6fe"],
    circle1: "#a78bfa",
    circle2: "#818cf8",
    accent: "#7c3aed",
    secondary: "#6366f1",
    previewBg: "from-purple-100 to-indigo-100",
    previewAccent: "text-purple-600",
    previewSecondary: "text-indigo-600",
  },
  {
    id: "nature",
    label: "Nature",
    swatch: "bg-gradient-to-br from-emerald-400 to-green-500",
    gradient: ["#d1fae5", "#ecfdf5", "#dcfce7"],
    circle1: "#34d399",
    circle2: "#4ade80",
    accent: "#059669",
    secondary: "#16a34a",
    previewBg: "from-emerald-100 to-green-100",
    previewAccent: "text-emerald-600",
    previewSecondary: "text-green-600",
  },
  {
    id: "ocean",
    label: "Ocean",
    swatch: "bg-gradient-to-br from-blue-400 to-cyan-500",
    gradient: ["#dbeafe", "#e0f2fe", "#cffafe"],
    circle1: "#60a5fa",
    circle2: "#22d3ee",
    accent: "#2563eb",
    secondary: "#0891b2",
    previewBg: "from-blue-100 to-cyan-100",
    previewAccent: "text-blue-600",
    previewSecondary: "text-cyan-600",
  },
];

interface ShareCardProps {
  onClose: () => void;
}

export default function ShareCard({ onClose }: ShareCardProps) {
  const store = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTheme, setSelectedTheme] = useState("rose");

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const week = dueDate ? getCurrentWeek(dueDate) : 20;
  const daysRemaining = dueDate ? getDaysRemaining(dueDate) : 0;
  const weekData = getWeekData(week);
  const babyName = store.babyName || "votre bebe";

  const theme = cardThemes.find((t) => t.id === selectedTheme) ?? cardThemes[0];

  const drawCard = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d")!;

      // Background gradient (theme-based)
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, theme.gradient[0]);
      gradient.addColorStop(0.5, theme.gradient[1]);
      gradient.addColorStop(1, theme.gradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Decorative circles (theme-based)
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = theme.circle1;
      ctx.beginPath();
      ctx.arc(200, 200, 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.circle2;
      ctx.beginPath();
      ctx.arc(900, 850, 250, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // White card
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      const margin = 80;
      roundRect(ctx, margin, margin, 1080 - 2 * margin, 1080 - 2 * margin, 60);
      ctx.fill();

      // Week label
      ctx.fillStyle = theme.accent;
      ctx.font = "bold 72px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Semaine ${week} 🤰`, 540, 260);

      // Fruit emoji large
      ctx.font = "180px sans-serif";
      ctx.fillText(weekData?.fruitEmoji ?? "🍎", 540, 480);

      // Fruit name
      ctx.font = "36px -apple-system, sans-serif";
      ctx.fillStyle = theme.secondary;
      ctx.fillText(weekData?.fruit ?? "", 540, 560);

      // Baby size info
      const sizeMm = weekData?.sizeMm ?? 0;
      const weightG = weekData?.weightG ?? 0;
      const sizeStr = sizeMm >= 10 ? `${(sizeMm / 10).toFixed(1)} cm` : `${sizeMm} mm`;
      const weightStr = weightG >= 1000 ? `${(weightG / 1000).toFixed(1)} kg` : `${weightG} g`;
      ctx.font = "bold 36px -apple-system, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(`📏 ${sizeStr}  ·  ⚖️ ${weightStr}`, 540, 630);

      // Days remaining
      ctx.font = "bold 44px -apple-system, sans-serif";
      ctx.fillStyle = "#374151";
      ctx.fillText(`${daysRemaining} jours avant l'arrivée de`, 540, 730);
      ctx.fillStyle = theme.accent;
      ctx.font = "bold 60px -apple-system, sans-serif";
      ctx.fillText(babyName, 540, 810);

      // MamaTrack branding
      ctx.font = "bold 40px -apple-system, sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("MamaTrack 🌸", 540, 950);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/png");
    });
  }, [week, weekData, daysRemaining, babyName, theme]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const shareText = `Semaine ${week} - Bebe fait la taille d'un(e) ${weekData?.fruit ?? "fruit"} ! ${weekData?.fruitEmoji ?? ""}\n${daysRemaining} jours avant l'arrivee de ${babyName} 💕\n#MamaTrack #Grossesse`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">✨ Partager ma grossesse</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme picker */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {cardThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              className={`w-9 h-9 rounded-full ${t.swatch} transition-all ${
                selectedTheme === t.id
                  ? "ring-2 ring-offset-2 ring-pink-400 scale-110"
                  : "hover:scale-105 opacity-70 hover:opacity-100"
              }`}
              aria-label={t.label}
              title={t.label}
            />
          ))}
        </div>

        {/* Preview */}
        <div className={`bg-gradient-to-br ${theme.previewBg} rounded-2xl p-6 mb-4 text-center transition-colors duration-300`}>
          <p className="text-4xl mb-1">🤰</p>
          <p className={`text-2xl font-bold ${theme.previewAccent}`}>Semaine {week}</p>
          <p className="text-6xl my-2">{weekData?.fruitEmoji ?? "🍎"}</p>
          <p className={`text-sm ${theme.previewSecondary} font-medium`}>{weekData?.fruit ?? ""}</p>
          {weekData && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📏 {weekData.sizeMm >= 10 ? `${(weekData.sizeMm / 10).toFixed(1)} cm` : `${weekData.sizeMm} mm`}
              {" · "}
              ⚖️ {weekData.weightG >= 1000 ? `${(weekData.weightG / 1000).toFixed(1)} kg` : `${weekData.weightG} g`}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
            {daysRemaining} jours avant l&apos;arrivee de <strong>{babyName}</strong>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">MamaTrack 🌸</p>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Social share buttons */}
        <SocialShareButtons
          content={{
            text: shareText,
            fileName: `mamatrack-semaine-${week}.png`,
          }}
          onImageGenerate={drawCard}
        />
      </motion.div>
    </motion.div>
  );
}
