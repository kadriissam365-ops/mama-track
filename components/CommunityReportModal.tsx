"use client";

import { m as motion, AnimatePresence } from "framer-motion";
import { Flag } from "lucide-react";

const REPORT_REASONS = [
  "Contenu inapproprie",
  "Spam",
  "Information medicale dangereuse",
  "Harcelement",
  "Autre",
];

interface Props {
  open: boolean;
  reportReason: string;
  reportSubmitted: boolean;
  setReportReason: (reason: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CommunityReportModal({
  open,
  reportReason,
  reportSubmitted,
  setReportReason,
  onClose,
  onSubmit,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-white dark:bg-[#1a1a2e] rounded-3xl p-6 space-y-4"
          >
            {reportSubmitted ? (
              <>
                <div className="text-center space-y-3 py-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Flag className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-[#3d2b2b] dark:text-gray-100">
                    Merci pour votre signalement
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notre equipe examinera ce post dans les plus brefs delais.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-pink-400 text-white"
                >
                  Fermer
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-[#3d2b2b] dark:text-gray-100">
                    Signaler ce post
                  </h3>
                </div>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                        reportReason === reason
                          ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={!reportReason}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-400 text-white disabled:opacity-50"
                  >
                    Signaler
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
