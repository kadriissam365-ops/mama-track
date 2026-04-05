"use client";
import { useEffect, useState } from 'react';
import { initInstallPrompt, canInstall, promptInstall } from '@/lib/pwa-install';

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    initInstallPrompt();
    const timer = setTimeout(() => {
      if (canInstall()) setShow(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 shadow-lg z-40 flex items-center gap-3">
      <span className="text-2xl">📱</span>
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">Installer MamaTrack</p>
        <p className="text-pink-100 text-xs">Accès rapide depuis l&apos;écran d&apos;accueil</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShow(false)} className="text-pink-200 text-sm px-2">Plus tard</button>
        <button
          onClick={async () => { await promptInstall(); setShow(false); }}
          className="bg-white text-pink-600 text-sm font-semibold px-3 py-1.5 rounded-xl"
        >
          Installer
        </button>
      </div>
    </div>
  );
}
