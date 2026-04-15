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
  description: "L'app gratuite pour suivre votre grossesse semaine par semaine. Poids, symptômes, contractions, mode duo, prénoms, projet naissance et plus. Sans pub, sans abonnement.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://mamatrack.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://mamatrack.fr",
    siteName: "MamaTrack",
    title: "MamaTrack — Suivi de grossesse gratuit et complet",
    description: "Suivez votre grossesse semaine par semaine. 10 trackers, mode duo, prénoms, projet naissance PDF. 100% gratuit, sans pub.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MamaTrack — Votre compagnon de grossesse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MamaTrack — Suivi de grossesse gratuit",
    description: "L'app gratuite pour suivre votre grossesse. Mode duo, 250+ prénoms, projet naissance PDF.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MamaTrack",
  },
  applicationName: "MamaTrack",
  keywords: ["grossesse", "suivi grossesse", "bébé", "maternité", "santé", "femme enceinte", "suivi semaine", "contractions", "prénoms bébé", "projet naissance", "app grossesse gratuite"],
  authors: [{ name: "MamaTrack" }],
  creator: "MamaTrack",
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full flex flex-col bg-[#fdf6f0]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
