"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Check, MessageCircle, Facebook, Twitter } from "lucide-react";

export interface ShareContent {
  text: string;
  url?: string;
  imageBlob?: Blob | null;
  fileName?: string;
}

interface SocialShareButtonsProps {
  content: ShareContent;
  onImageGenerate?: () => Promise<Blob>;
  compact?: boolean;
}

type ShareStatus = "idle" | "sharing" | "copied" | "done" | "error";

export default function SocialShareButtons({ content, onImageGenerate, compact = false }: SocialShareButtonsProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const resetStatus = () => {
    setTimeout(() => {
      setStatus("idle");
      setStatusMessage("");
    }, 2500);
  };

  const handleWebShare = async () => {
    setStatus("sharing");
    try {
      const shareData: ShareData = {
        title: "MamaTrack",
        text: content.text,
      };
      if (content.url) shareData.url = content.url;

      if (onImageGenerate) {
        const blob = await onImageGenerate();
        const file = new File([blob], content.fileName ?? "mamatrack.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }

      await navigator.share(shareData);
      setStatus("done");
      setStatusMessage("Partagé !");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStatus("error");
        setStatusMessage("Erreur de partage");
      } else {
        setStatus("idle");
      }
    }
    resetStatus();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(content.text + (content.url ? `\n${content.url}` : ""));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(content.url || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=400");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(content.text);
    const url = content.url ? `&url=${encodeURIComponent(content.url)}` : "";
    window.open(`https://twitter.com/intent/tweet?text=${text}${url}`, "_blank", "width=600,height=400");
  };

  const handleInstagram = async () => {
    setStatus("sharing");
    try {
      let blob: Blob | null = content.imageBlob ?? null;
      if (!blob && onImageGenerate) {
        blob = await onImageGenerate();
      }
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setStatus("copied");
        setStatusMessage("Image copiee ! Collez-la dans Instagram Stories");
      } else {
        await navigator.clipboard.writeText(content.text);
        setStatus("copied");
        setStatusMessage("Texte copie ! Collez-le dans Instagram");
      }
    } catch {
      // Fallback: copy text
      try {
        await navigator.clipboard.writeText(content.text);
        setStatus("copied");
        setStatusMessage("Texte copie ! Collez-le dans Instagram");
      } catch {
        setStatus("error");
        setStatusMessage("Impossible de copier");
      }
    }
    resetStatus();
  };

  const handleDownload = async () => {
    setStatus("sharing");
    try {
      let blob: Blob | null = content.imageBlob ?? null;
      if (!blob && onImageGenerate) {
        blob = await onImageGenerate();
      }
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = content.fileName ?? "mamatrack.png";
        a.click();
        URL.revokeObjectURL(url);
        setStatus("done");
        setStatusMessage("Telecharge !");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Erreur de telechargement");
    }
    resetStatus();
  };

  const buttonBase = compact
    ? "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
    : "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all active:scale-95";

  const platforms = [
    ...(typeof navigator !== "undefined" && "share" in navigator
      ? [
          {
            key: "native",
            label: "Partager",
            icon: <Copy className="w-4 h-4" />,
            color: "bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600",
            onClick: handleWebShare,
          },
        ]
      : []),
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="w-4 h-4" />,
      color: "bg-[#25D366] text-white hover:bg-[#1da851]",
      onClick: handleWhatsApp,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <Facebook className="w-4 h-4" />,
      color: "bg-[#1877F2] text-white hover:bg-[#1565c0]",
      onClick: handleFacebook,
    },
    {
      key: "twitter",
      label: "X / Twitter",
      icon: <Twitter className="w-4 h-4" />,
      color: "bg-[#0f1419] text-white hover:bg-[#272c30]",
      onClick: handleTwitter,
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      color: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] text-white hover:opacity-90",
      onClick: handleInstagram,
    },
    {
      key: "download",
      label: "Telecharger",
      icon: <Download className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
      onClick: handleDownload,
    },
  ];

  return (
    <div className="space-y-3">
      {compact ? (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {platforms.map((p) => (
            <motion.button
              key={p.key}
              whileTap={{ scale: 0.9 }}
              onClick={p.onClick}
              title={p.label}
              className={`${buttonBase} ${p.color}`}
            >
              {p.icon}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {platforms.map((p) => (
            <motion.button
              key={p.key}
              whileTap={{ scale: 0.97 }}
              onClick={p.onClick}
              className={`${buttonBase} ${p.color}`}
            >
              {p.icon}
              <span>{p.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Status message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`text-center text-xs font-medium py-2 rounded-xl ${
            status === "copied"
              ? "bg-green-50 text-green-600"
              : status === "done"
              ? "bg-blue-50 text-blue-600"
              : status === "error"
              ? "bg-red-50 text-red-600"
              : "bg-gray-50 text-gray-500"
          }`}
        >
          {status === "copied" && <Check className="w-3 h-3 inline mr-1" />}
          {statusMessage}
        </motion.div>
      )}
    </div>
  );
}
