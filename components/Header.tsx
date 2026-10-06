"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogOut, Settings, Users, Download } from "lucide-react";
import FamilySwitcher from "@/components/FamilySwitcher";
import BrandMark from "@/components/BrandMark";
import { useFamily } from "@/lib/family";
import { childAgeLabel } from "@/lib/family-journey";

export default function Header() {
  const router = useRouter(),
    pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const family = useFamily();
  const inBaby = pathname.startsWith("/enfant");
  const child = family.babies.find((baby) => baby.id === family.activeBabyId);
  useEffect(() => {
    if (!showMenu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
        buttonRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [showMenu]);
  return (
    <header className="mt-app-header">
      <div className="mt-header-inner">
        <div className="mt-topbar">
          <BrandMark />
          <p className="mt-topbar-detail">
            {inBaby && child ? (
              <>
                <strong>{child.name}</strong> ·{" "}
                {childAgeLabel(child.birth_date)}
              </>
            ) : (
              "Votre petit refuge, chaque jour"
            )}
          </p>
          <div className="relative" ref={menuRef}>
            <button
              ref={buttonRef}
              onClick={() => setShowMenu((value) => !value)}
              className="mt-profile-button"
              aria-label="Menu du compte"
              aria-expanded={showMenu}
              aria-controls="account-menu"
            >
              {user?.email?.charAt(0).toUpperCase() ?? "P"}
            </button>
            {showMenu && (
              <div id="account-menu" className="mt-account-menu">
                <div className="px-2 py-2 mb-1 border-b border-border">
                  <p className="truncate text-xs font-semibold">
                    {user?.email}
                  </p>
                  <p className="mt-1 text-[10px] text-foreground-muted">
                    Votre compte familial
                  </p>
                </div>
                <Link
                  href={inBaby ? "/enfant/settings" : "/settings"}
                  onClick={() => setShowMenu(false)}
                >
                  <Settings size={16} />
                  Réglages
                </Link>
                <Link
                  href={inBaby ? "/enfant/duo" : "/duo"}
                  onClick={() => setShowMenu(false)}
                >
                  <Users size={16} />
                  Mes proches
                </Link>
                <Link href="/settings" onClick={() => setShowMenu(false)}>
                  <Download size={16} />
                  Mes données
                </Link>
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    await signOut();
                    router.push("/auth/login");
                  }}
                  className="text-danger"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
        <FamilySwitcher />
      </div>
    </header>
  );
}
