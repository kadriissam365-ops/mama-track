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
    default: "MamaTrack — Suivi de grossesse gratuit et complet",
    template: "%s | MamaTrack",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  description: "L'app gratuite pour suivre votre grossesse semaine par semaine. Poids, symptomes, contractions, mode duo, prenoms, projet naissance et plus. Sans pub, sans abonnement.",
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
    title: "MamaTrack — Suivi de grossesse gratuit et complet",
    description: "Suivez votre grossesse semaine par semaine : 10+ trackers sante, mode duo, 250+ prenoms, chrono contractions, projet naissance PDF. 100% gratuit, sans pub, sans abonnement.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MamaTrack — Votre compagnon de grossesse gratuit",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mamatrack_fr",
    creator: "@mamatrack_fr",
    title: "MamaTrack — Suivi de grossesse gratuit et complet",
    description: "Suivez votre grossesse semaine par semaine. 10+ trackers, mode duo, 250+ prenoms, projet naissance PDF. 100% gratuit, sans pub.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MamaTrack — Votre compagnon de grossesse gratuit",
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
  themeColor: "#f472b6",
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
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        
        {/* Splash screens for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="h-screen flex flex-col overflow-hidden bg-[#fdf6f0] dark:bg-[#0f0f1a]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <StoreProvider>
              <OfflineBanner />
              <ConditionalNav />
              <InstallBanner />
              <main className="flex-1 pb-24 overflow-y-auto">
                {children}
              </main>
            </StoreProvider>
          </ToastProvider>
        </AuthProvider>
        </I18nProvider>
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed: ', error);
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
