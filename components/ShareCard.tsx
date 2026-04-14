"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getCurrentWeek, getDaysRemaining, getWeekData } from "@/lib/pregnancy-data";
import SocialShareButtons from "@/components/SocialShareButtons";

interface ShareCardProps {
  onClose: () => void;
}

export default function ShareCard({ onClose }: ShareCardProps) {
  const store = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const week = dueDate ? getCurrentWeek(dueDate) : 20;
  const daysRemaining = dueDate ? getDaysRemaining(dueDate) : 0;
  const weekData = getWeekData(week);
  const babyName = store.babyName || "votre bebe";

  const drawCard = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d")!;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, "#fce7f3");
      gradient.addColorStop(0.5, "#ede9fe");
      gradient.addColorStop(1, "#ddd6fe");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Decorative circles
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(200, 200, 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a78bfa";
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
      ctx.fillStyle = "#db2777";
      ctx.font = "bold 72px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Semaine ${week} 🤰`, 540, 280);

      // Fruit emoji large
      ctx.font = "200px sans-serif";
      ctx.fillText(weekData?.fruitEmoji ?? "🍎", 540, 520);

      // Fruit name
      ctx.font = "36px -apple-system, sans-serif";
      ctx.fillStyle = "#7c3aed";
      ctx.fillText(weekData?.fruit ?? "", 540, 600);

      // Days remaining
      ctx.font = "bold 48px -apple-system, sans-serif";
      ctx.fillStyle = "#374151";
      ctx.fillText(`${daysRemaining} jours avant l'arrivée de`, 540, 720);
      ctx.fillStyle = "#db2777";
      ctx.font = "bold 64px -apple-system, sans-serif";
      ctx.fillText(babyName, 540, 800);

      // MamaTrack branding
      ctx.font = "bold 40px -apple-system, sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("MamaTrack 🌸", 540, 950);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/png");
    });
  }, [week, weekData, daysRemaining, babyName]);

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 mb-4 text-center">
          <p className="text-4xl mb-1">🤰</p>
          <p className="text-2xl font-bold text-pink-600">Semaine {week}</p>
          <p className="text-6xl my-2">{weekData?.fruitEmoji ?? "🍎"}</p>
          <p className="text-sm text-purple-600 font-medium">{weekData?.fruit ?? ""}</p>
          <p className="text-gray-600 text-sm mt-2">
            {daysRemaining} jours avant l&apos;arrivee de <strong>{babyName}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-2">MamaTrack 🌸</p>
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
