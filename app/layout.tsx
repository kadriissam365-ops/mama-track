import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";
import ConditionalNav from "@/components/ConditionalNav";
import InstallBanner from "@/components/InstallBanner";
import OfflineBanner from "@/components/OfflineBanner";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import MotionProvider from "@/components/MotionProvider";
import { FamilyProvider } from "@/lib/family";
import { AiConsentProvider } from "@/lib/use-ai-consent";
import "./enfant.css";
import AppContent from "@/components/AppContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MamaTrack — De la grossesse aux 6 ans de votre enfant",
    template: "%s | MamaTrack",
  },
  icons: {
    icon: [{ url: "/icons/icon-192x192.png", type: "image/png" }],
    apple: "/icons/icon-192x192.png",
  },
  description:
    "De la grossesse aux 6 ans : votre carnet de famille pour les repas, le sommeil, la croissance, les vaccins, les routines et tous les beaux souvenirs. Suivi essentiel gratuit, options Premium.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://mamatrack.fr"),
  alternates: {
    canonical: "https://mamatrack.fr",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://mamatrack.fr",
    siteName: "MamaTrack",
    title: "MamaTrack — Votre grande aventure, de la grossesse aux 6 ans",
    description:
      "Un carnet familial de la grossesse aux 6 ans : naissance, repas, sommeil, routines, croissance et souvenirs. Suivi essentiel gratuit, options Premium.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MamaTrack — Votre histoire de famille, de la grossesse à 6 ans",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mamatrack_fr",
    creator: "@mamatrack_fr",
    title: "MamaTrack — De la grossesse aux 6 ans",
    description:
      "Grossesse, naissance, premières années et grandes aventures : un carnet pour toute la famille.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MamaTrack — Votre histoire de famille, de la grossesse à 6 ans",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MamaTrack",
  },
  applicationName: "MamaTrack",
  keywords: [
    "grossesse",
    "suivi grossesse",
    "bebe",
    "maternite",
    "sante",
    "femme enceinte",
    "suivi semaine par semaine",
    "contractions",
    "prenoms bebe",
    "projet naissance",
    "app grossesse gratuite",
    "mode duo grossesse",
    "poids grossesse",
    "symptomes grossesse",
    "PMA",
    "FIV",
    "PWA grossesse",
  ],
  authors: [{ name: "MamaTrack" }],
  creator: "MamaTrack",
  publisher: "MamaTrack",
  category: "health",
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  other: {
    "google-site-verification": "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#274c40",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MamaTrack" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/icon-192x192.png"
        />

        {/* Splash screens for iOS */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="h-dvh flex flex-col overflow-hidden bg-background">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <I18nProvider>
            <AuthProvider>
              <FamilyProvider>
                <AiConsentProvider>
                  <ToastProvider>
                    <StoreProvider>
                      <MotionProvider>
                        <OfflineBanner />
                        <ConditionalNav />
                        <InstallBanner />
                        <a href="#contenu-principal" className="skip-link">
                          Aller au contenu principal
                        </a>
                        <AppContent>{children}</AppContent>
                      </MotionProvider>
                    </StoreProvider>
                  </ToastProvider>
                </AiConsentProvider>
              </FamilyProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && ${process.env.NODE_ENV !== "production"}) {
                navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.filter(reg => ['/service-worker.js','/sw.js'].some(path => (reg.active?.scriptURL || '').endsWith(path))).map(reg => reg.unregister())));
                caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mamatrack-')).map(key => caches.delete(key))));
              }
              if ('serviceWorker' in navigator && ${process.env.NODE_ENV === "production"}) {
                window.addEventListener('load', function() {
                  // Unregister old /sw.js (stuck in Vercel edge cache) before
                  // registering the new /service-worker.js path.
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(reg) {
                      if (reg.active && reg.active.scriptURL.endsWith('/sw.js')) {
                        reg.unregister();
                      }
                    });
                  }).finally(function() {
                    navigator.serviceWorker.register('/service-worker.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration.scope);
                      })
                      .catch(function(error) {
                        console.log('SW registration failed: ', error);
                      });
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
