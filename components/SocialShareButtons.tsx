"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Check, MessageCircle, Share2 } from "lucide-react";

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
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      color: "bg-[#1877F2] text-white hover:bg-[#1565c0]",
      onClick: handleFacebook,
    },
    {
      key: "twitter",
      label: "X / Twitter",
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
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
      key: "tiktok",
      label: "TikTok",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.14 8.14 0 004.77 1.53V11.3a4.83 4.83 0 01-.81.07 4.85 4.85 0 01-.38-4.68z" />
        </svg>
      ),
      color: "bg-[#010101] text-white hover:bg-[#333]",
      onClick: handleInstagram,
    },
    {
      key: "pinterest",
      label: "Pinterest",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
        </svg>
      ),
      color: "bg-[#E60023] text-white hover:bg-[#c5001e]",
      onClick: () => {
        const url = encodeURIComponent(content.url || window.location.href);
        const desc = encodeURIComponent(content.text);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${desc}`, "_blank", "width=600,height=500");
      },
    },
    {
      key: "download",
      label: "Telecharger",
      icon: <Download className="w-4 h-4" />,
      color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
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
              ? "bg-green-50 dark:bg-green-950/30 text-green-600"
              : status === "done"
              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
              : status === "error"
              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
              : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          }`}
        >
          {status === "copied" && <Check className="w-3 h-3 inline mr-1" />}
          {statusMessage}
        </motion.div>
      )}
    </div>
  );
}
