"use client";
import { useEffect, useState } from 'react';
import { initInstallPrompt, canInstall, promptInstall } from '@/lib/pwa-install';

const DISMISS_KEY = 'mamatrack-install-dismissed';

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    initInstallPrompt();
    const timer = setTimeout(() => {
      if (canInstall()) setShow(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 shadow-lg z-40 flex items-center gap-3">
      <span className="text-2xl">📱</span>
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">Installer MamaTrack</p>
        <p className="text-pink-100 text-xs">Accès rapide depuis l&apos;écran d&apos;accueil</p>
      </div>
      <div className="flex gap-2">
        <button onClick={handleDismiss} className="text-pink-200 text-sm px-2">Plus tard</button>
        <button
          onClick={async () => { await promptInstall(); handleDismiss(); }}
          className="bg-white dark:bg-gray-900 text-pink-600 dark:text-pink-400 text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-pink-50 dark:hover:bg-gray-800"
        >
          Installer
        </button>
      </div>
    </div>
  );
}
