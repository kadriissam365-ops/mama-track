import { ToastProvider } from "@/components/enfant/ui/Toast";

export const metadata = { robots: { index: false, follow: false } };

export default function BabyLayout({ children }: { children: React.ReactNode }) {
  return <div className="baby-space min-h-full"><ToastProvider>{children}</ToastProvider></div>;
}
