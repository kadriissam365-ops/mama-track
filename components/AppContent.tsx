"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const hidden = ["/auth", "/onboarding", "/invite", "/enfant/p/"].some(
    (path) => pathname.startsWith(path),
  );
  return (
    <main
      id="contenu-principal"
      className={`mt-main ${isAuthenticated && !hidden ? "mt-main-authenticated" : ""}`}
    >
      {children}
    </main>
  );
}
