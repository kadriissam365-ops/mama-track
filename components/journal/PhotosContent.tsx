"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Trash2, ChevronLeft, Edit3, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { getCurrentWeek } from "@/lib/pregnancy-data";
import {
  getBumpPhotos,
  getBumpPhotoSignedUrl,
  upsertBumpPhoto,
  deleteBumpPhoto,
  updateBumpPhotoNote,
  type BumpPhoto,
} from "@/lib/supabase-api";
import { compressImage } from "@/lib/compress-image";

interface WeekSlot {
  week: number;
  photo: BumpPhoto | null;
  signedUrl: string | null;
}

export default function PhotosContent() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useStore();
  const [slots, setSlots] = useState<WeekSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [modalSlot, setModalSlot] = useState<WeekSlot | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editNote, setEditNote] = useState<{ week: number; value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadWeekRef = useRef<number>(0);

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const currentWeek = dueDate ? getCurrentWeek(dueDate) : 20;

  const loadPhotos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const photos = await getBumpPhotos(user.id);

    const photoMap = new Map(photos.map((p) => [p.week, p]));
    const newSlots: WeekSlot[] = [];

    for (let w = 4; w <= Math.max(currentWeek, 4); w++) {
      const photo = photoMap.get(w) || null;
      let signedUrl: string | null = null;
      if (photo) {
        signedUrl = await getBumpPhotoSignedUrl(photo.storage_path);
      }
      newSlots.push({ week: w, photo, signedUrl });
    }

    setSlots(newSlots.reverse());
    setLoading(false);
  }, [user, currentWeek]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const week = uploadWeekRef.current;
    setUploading(week);
    try {
      const compressed = await compressImage(file);
      const result = await upsertBumpPhoto(user.id, week, compressed);
      if (result) {
        await loadPhotos();
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (week: number) => {
    uploadWeekRef.current = week;
    fileInputRef.current?.click();
  };

  const handleDelete = async (slot: WeekSlot) => {
    if (!user || !slot.photo) return;
    await deleteBumpPhoto(user.id, slot.week, slot.photo.storage_path);
    setDeleteConfirm(null);
    setModalSlot(null);
    await loadPhotos();
  };

  const handleSaveNote = async (week: number, note: string) => {
    if (!user) return;
    await updateBumpPhotoNote(user.id, week, note);
    setEditNote(null);
    await loadPhotos();
  };

  const photoCount = slots.filter((s) => s.photo).length;

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-pink-100 dark:border-pink-900/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Photos ventre</h1>
            <p className="text-xs text-rose-500">
              {photoCount} photo{photoCount !== 1 ? "s" : ""} capturee{photoCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-pink-100 dark:bg-pink-900/30" />

            <div className="space-y-4">
              {slots.map((slot, idx) => (
                <motion.div
                  key={slot.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex gap-4 items-start"
                >
                  {/* Week dot */}
                  <div className="flex flex-col items-center flex-shrink-0 z-10">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-3 ${
                        slot.photo ? "bg-rose-400 border-rose-400" : "bg-white dark:bg-gray-900 border-pink-300"
                      }`}
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Semaine {slot.week}</span>
                      {slot.week === currentWeek && (
                        <span className="text-[10px] bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-full px-2 py-0.5">
                          Actuelle
                        </span>
                      )}
                    </div>

                    {slot.photo && slot.signedUrl ? (
                      <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm border border-pink-100 dark:border-pink-900/30">
                        <button onClick={() => setModalSlot(slot)} className="w-full relative">
                          <div
                            className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative"
                            style={{ aspectRatio: "1/1" }}
                          >
                            <Image
                              src={slot.signedUrl}
                              alt={`Semaine ${slot.week}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 512px) 100vw, 512px"
                            />
                          </div>
                        </button>

                        {/* Note */}
                        {editNote?.week === slot.week ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              className="flex-1 text-xs border border-pink-200 dark:border-pink-800/30 rounded-lg px-2 py-1 focus:outline-none focus:border-pink-400"
                              value={editNote.value}
                              onChange={(e) => setEditNote({ week: slot.week, value: e.target.value })}
                              placeholder="Note pour cette semaine..."
                            />
                            <button
                              onClick={() => handleSaveNote(slot.week, editNote.value)}
                              className="p-1 bg-pink-100 dark:bg-pink-900/30 rounded-lg"
                            >
                              <Check className="w-4 h-4 text-pink-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-start justify-between gap-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">
                              {slot.photo.note || (
                                <span className="italic text-gray-400 dark:text-gray-500">Ajouter une note...</span>
                              )}
                            </p>
                            <button
                              onClick={() =>
                                setEditNote({ week: slot.week, value: slot.photo?.note || "" })
                              }
                              className="flex-shrink-0 p-1 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 rounded-lg"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            </button>
                          </div>
                        )}

                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {new Date(slot.photo.captured_at).toLocaleDateString("fr-FR")}
                          </span>
                          <button
                            onClick={() => setDeleteConfirm(slot.week)}
                            className="text-[10px] text-red-400 hover:text-red-600 dark:text-red-400 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerUpload(slot.week)}
                        disabled={uploading !== null}
                        className="w-full bg-white dark:bg-gray-900 border-2 border-dashed border-pink-200 dark:border-pink-800/30 rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 dark:bg-pink-950/30 transition-all"
                      >
                        {uploading === slot.week ? (
                          <div className="w-6 h-6 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-pink-300" />
                            <span className="text-xs text-pink-400">Ajouter une photo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Photo modal */}
      <AnimatePresence>
        {modalSlot && modalSlot.signedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setModalSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Semaine {modalSlot.week}</span>
                  <button onClick={() => setModalSlot(null)}>
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                  <Image
                    src={modalSlot.signedUrl}
                    alt={`Semaine ${modalSlot.week}`}
                    fill
                    className="object-contain rounded-xl"
                    sizes="(max-width: 400px) 100vw, 400px"
                    priority
                  />
                </div>
                {modalSlot.photo?.note && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{modalSlot.photo.note}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-lg"
            >
              <p className="text-center font-semibold text-gray-800 dark:text-gray-200 mb-2">Supprimer cette photo ?</p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Cette action est irreversible</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const slot = slots.find((s) => s.week === deleteConfirm);
                    if (slot) handleDelete(slot);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-50 dark:bg-red-950/300 text-white font-medium"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
