"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Trash2, ChevronLeft, ChevronRight, Image, Calendar, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useStore } from "@/lib/store";
import { getCurrentWeek } from "@/lib/pregnancy-data";
import ConfirmDialog from "@/components/ConfirmDialog";

interface BumpPhoto {
  id: string;
  week: number;
  date: string;
  dataUrl: string;
  note: string;
}

function loadPhotos(): BumpPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mt-bump-photos") || "[]");
  } catch { return []; }
}

function savePhotos(photos: BumpPhoto[]) {
  localStorage.setItem("mt-bump-photos", JSON.stringify(photos));
}

export default function BumpPage() {
  const { dueDate } = useStore();
  const currentWeek = dueDate ? getCurrentWeek(new Date(dueDate)) : 20;
  const [photos, setPhotos] = useState<BumpPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeft, setCompareLeft] = useState<number | null>(null);
  const [compareRight, setCompareRight] = useState<number | null>(null);
  const [viewPhoto, setViewPhoto] = useState<BumpPhoto | null>(null);
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotos(loadPhotos());
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h * maxSize) / w; w = maxSize; }
          else { w = (w * maxSize) / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        const photo: BumpPhoto = {
          id: crypto.randomUUID(),
          week: currentWeek,
          date: format(new Date(), "yyyy-MM-dd"),
          dataUrl,
          note: note.trim(),
        };

        const updated = [...photos, photo].sort((a, b) => a.week - b.week);
        setPhotos(updated);
        savePhotos(updated);
        setShowCamera(false);
        setNote("");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function deletePhoto(id: string) {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    savePhotos(updated);
    setConfirmDelete(null);
    setViewPhoto(null);
  }

  const weekNumbers = Array.from(new Set(photos.map((p) => p.week))).sort((a, b) => a - b);
  const getPhotoForWeek = (week: number) => photos.find((p) => p.week === week);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 flex items-center gap-2">
            📸 Mon bump
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Suivez l&apos;évolution de votre ventre</p>
        </div>
        <div className="flex gap-2">
          {photos.length >= 2 && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                compareMode ? "bg-purple-400 text-white" : "bg-purple-50 dark:bg-purple-950/30 text-purple-500 border border-purple-200 dark:border-purple-800/30"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Comparer
            </button>
          )}
          <button
            onClick={() => setShowCamera(true)}
            className="w-10 h-10 bg-pink-400 rounded-xl flex items-center justify-center text-white hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors shadow-sm"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week indicator */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/20 rounded-2xl px-4 py-3 border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Semaine actuelle</p>
          <p className="text-lg font-bold text-[#3d2b2b] dark:text-gray-100">{currentWeek} SA</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-gray-500">Photos prises</p>
          <p className="text-lg font-bold text-pink-500">{photos.length}</p>
        </div>
      </div>

      {/* Compare mode */}
      <AnimatePresence>
        {compareMode && photos.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/30">
              <h3 className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100 mb-3">Avant / Après</h3>
              <div className="flex gap-3">
                {/* Left selector */}
                <div className="flex-1">
                  <select
                    value={compareLeft ?? ""}
                    onChange={(e) => setCompareLeft(Number(e.target.value))}
                    className="w-full text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-purple-200 dark:border-purple-800/30 rounded-xl px-2 py-1.5 mb-2"
                  >
                    <option value="">Semaine...</option>
                    {weekNumbers.map((w) => (
                      <option key={w} value={w}>Semaine {w}</option>
                    ))}
                  </select>
                  {compareLeft && getPhotoForWeek(compareLeft) ? (
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getPhotoForWeek(compareLeft)!.dataUrl}
                        alt={`Semaine ${compareLeft}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="flex items-center">
                  <ArrowLeftRight className="w-5 h-5 text-purple-300" />
                </div>

                {/* Right selector */}
                <div className="flex-1">
                  <select
                    value={compareRight ?? ""}
                    onChange={(e) => setCompareRight(Number(e.target.value))}
                    className="w-full text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-purple-200 dark:border-purple-800/30 rounded-xl px-2 py-1.5 mb-2"
                  >
                    <option value="">Semaine...</option>
                    {weekNumbers.map((w) => (
                      <option key={w} value={w}>Semaine {w}</option>
                    ))}
                  </select>
                  {compareRight && getPhotoForWeek(compareRight) ? (
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getPhotoForWeek(compareRight)!.dataUrl}
                        alt={`Semaine ${compareRight}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <motion.button
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setViewPhoto(photo)}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group"
            >
              <img
                src={photo.dataUrl}
                alt={`Semaine ${photo.week}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-semibold">SA {photo.week}</p>
                <p className="text-white/70 text-[10px]">
                  {format(new Date(photo.date), "d MMM", { locale: fr })}
                </p>
              </div>
            </motion.button>
          ))}

          {/* Add placeholder */}
          <button
            onClick={() => setShowCamera(true)}
            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-pink-200 dark:border-pink-800/30 flex flex-col items-center justify-center gap-1 hover:border-pink-400 transition-colors"
          >
            <Camera className="w-6 h-6 text-pink-300" />
            <span className="text-[10px] text-pink-400">SA {currentWeek}</span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Camera className="w-16 h-16 text-pink-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#3d2b2b] dark:text-gray-100 mb-2">Commencez votre journal bump !</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 px-8">
            Prenez une photo de votre ventre chaque semaine pour voir l&apos;évolution de votre grossesse
          </p>
          <button
            onClick={() => setShowCamera(true)}
            className="bg-pink-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-600 dark:bg-pink-500 transition-colors"
          >
            Prendre ma première photo
          </button>
        </motion.div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/20 rounded-3xl p-5 border border-pink-100 dark:border-pink-900/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-sm mb-1">Astuces pour de belles photos bump</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 leading-relaxed">
              <li>• Même endroit et même lumière chaque semaine</li>
              <li>• De profil, vêtements ajustés ou le ventre nu</li>
              <li>• Utilisez un minuteur pour être bien positionnée</li>
              <li>• Prenez la photo le même jour de la semaine</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCamera(false); }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-5 w-full max-w-md"
            >
              <h3 className="font-semibold text-[#3d2b2b] dark:text-gray-100 mb-4">📸 Photo semaine {currentWeek}</h3>

              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-pink-200 dark:border-pink-800/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 transition-all mb-4"
              >
                <Camera className="w-12 h-12 text-pink-300" />
                <p className="text-sm text-pink-400 font-medium">Appuyez pour choisir une photo</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">ou prendre depuis l&apos;appareil photo</p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                placeholder="Note (optionnel) — comment vous sentez-vous ?"
                rows={2}
                className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-pink-200 dark:border-pink-800/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none mb-3"
              />

              <button
                onClick={() => setShowCamera(false)}
                className="w-full text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:text-gray-300"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo viewer */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex flex-col"
            onClick={(e) => { if (e.target === e.currentTarget) setViewPhoto(null); }}
          >
            <div className="flex items-center justify-between p-4">
              <button onClick={() => setViewPhoto(null)} className="text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-center">
                <p className="text-white font-semibold">Semaine {viewPhoto.week}</p>
                <p className="text-white/60 text-xs">
                  {format(new Date(viewPhoto.date), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(viewPhoto.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={viewPhoto.dataUrl}
                alt={`Semaine ${viewPhoto.week}`}
                className="max-w-full max-h-full rounded-2xl object-contain"
              />
            </div>
            {viewPhoto.note && (
              <div className="p-4 text-center">
                <p className="text-white/80 text-sm italic">&quot;{viewPhoto.note}&quot;</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-center gap-4 pb-8">
              {(() => {
                const idx = photos.findIndex((p) => p.id === viewPhoto.id);
                return (
                  <>
                    <button
                      onClick={() => idx > 0 && setViewPhoto(photos[idx - 1])}
                      disabled={idx <= 0}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => idx < photos.length - 1 && setViewPhoto(photos[idx + 1])}
                      disabled={idx >= photos.length - 1}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer cette photo ?"
        message="Cette action est irréversible."
        onConfirm={() => confirmDelete && deletePhoto(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
