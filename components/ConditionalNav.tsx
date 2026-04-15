"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const HIDDEN_PATHS = ["/auth", "/onboarding", "/invite"];

export default function ConditionalNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isHidden = HIDDEN_PATHS.some((path) => pathname.startsWith(path));

  if (isHidden || !isAuthenticated) return null;

  return (
    <>
      <Header />
      <BottomNav />
    </>
  );
}
