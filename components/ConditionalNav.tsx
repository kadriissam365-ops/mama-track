"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const HIDDEN_PATHS = ["/auth", "/onboarding", "/invite"];

export default function ConditionalNav() {
  const pathname = usePathname();
  const isHidden = HIDDEN_PATHS.some((path) => pathname.startsWith(path));

  if (isHidden) return null;

  return (
    <>
      <Header />
      <BottomNav />
    </>
  );
}
