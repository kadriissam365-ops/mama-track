"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { getBumpPhotos, getBumpPhotoSignedUrl, type BumpPhoto } from "@/lib/supabase-api";

interface PhotoWithUrl extends BumpPhoto {
  signedUrl: string;
}

export default function GalerieContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<PhotoWithUrl | null>(null);

  const loadPhotos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const raw = await getBumpPhotos(user.id);
    const withUrls: PhotoWithUrl[] = [];
    for (const p of raw) {
      const url = await getBumpPhotoSignedUrl(p.storage_path);
      if (url) withUrls.push({ ...p, signedUrl: url });
    }
    withUrls.sort((a, b) => a.week - b.week);
    setPhotos(withUrls);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return (
    <div className="max-w-lg mx-auto" style={{ background: "#fdfaf6", minHeight: "100vh" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-violet-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-violet-50">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Galerie</h1>
            <p className="text-xs text-violet-500">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} -- retrospective
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎞️</p>
            <p className="text-gray-500 text-sm">Aucune photo pour l&apos;instant</p>
            <button
              onClick={() => router.push("/journal/photos")}
              className="mt-4 text-sm text-violet-500 underline"
            >
              Ajouter ma premiere photo
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 text-center">
              Ton evolution de la semaine {photos[0]?.week} a la semaine{" "}
              {photos[photos.length - 1]?.week}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, idx) => (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setModal(photo)}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-violet-100 active:scale-95 transition-transform"
                >
                  <div className="relative" style={{ aspectRatio: "1/1" }}>
                    <Image
                      src={photo.signedUrl}
                      alt={`Semaine ${photo.week}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 512px) 50vw, 256px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-2">
                      <span className="text-white text-xs font-semibold">S.{photo.week}</span>
                    </div>
                  </div>
                  {photo.note && (
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] text-gray-500 line-clamp-2">{photo.note}</p>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">Semaine {modal.week}</span>
                  <button onClick={() => setModal(null)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                  <Image
                    src={modal.signedUrl}
                    alt={`Semaine ${modal.week}`}
                    fill
                    className="object-contain rounded-xl"
                    sizes="(max-width: 400px) 100vw, 400px"
                    priority
                  />
                </div>
                {modal.note && <p className="mt-3 text-sm text-gray-600">{modal.note}</p>}
                <p className="mt-2 text-xs text-gray-300 text-right">
                  {new Date(modal.captured_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
