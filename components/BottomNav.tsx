"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Activity,
  BookHeart,
  CalendarDays,
  Grid2X2,
  Sparkles,
  Heart,
  Sprout,
  Users,
  ArrowUpRight,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useFamily } from "@/lib/family";
import { childPhase } from "@/lib/family-journey";

export default function BottomNav() {
  const pathname = usePathname(),
    family = useFamily();
  const inChild = pathname.startsWith("/enfant");
  const selected = family.babies.find(
    (baby) => baby.id === family.activeBabyId,
  );
  const older = selected ? childPhase(selected.birth_date) === "child" : false;
  const items = inChild
    ? [
        {
          href: "/enfant/dashboard",
          label: "Aujourd’hui",
          mobile: "Accueil",
          Icon: Home,
        },
        {
          href: older ? "/enfant/routines" : "/enfant/feed",
          label: older ? "Ses routines" : "Son quotidien",
          mobile: "Suivi",
          Icon: Activity,
        },
        {
          href: "/enfant/diary",
          label: "Nos souvenirs",
          mobile: "Souvenirs",
          Icon: BookHeart,
        },
        {
          href: "/enfant/agenda",
          label: "Notre agenda",
          mobile: "Agenda",
          Icon: CalendarDays,
        },
        {
          href: "/enfant/plus",
          label: "Tous les outils",
          mobile: "Plus",
          Icon: Grid2X2,
        },
      ]
    : [
        { href: "/", label: "Aujourd’hui", mobile: "Accueil", Icon: Home },
        {
          href: "/tracking",
          label: "Mon bien-être",
          mobile: "Suivi",
          Icon: Activity,
        },
        {
          href: "/journal",
          label: "Nos souvenirs",
          mobile: "Souvenirs",
          Icon: BookHeart,
        },
        {
          href: "/agenda",
          label: "Notre agenda",
          mobile: "Agenda",
          Icon: CalendarDays,
        },
        {
          href: "/plus",
          label: "Tous les outils",
          mobile: "Plus",
          Icon: Grid2X2,
        },
      ];
  const active = (href: string): boolean => {
    if (href === "/" || href.endsWith("dashboard")) return pathname === href;
    if (href === "/journal")
      return ["/journal", "/bump"].some((path) => pathname.startsWith(path));
    if (href.endsWith("/diary"))
      return ["/enfant/diary", "/enfant/milestones"].some((path) =>
        pathname.startsWith(path),
      );
    if (href === "/enfant/feed" || href === "/enfant/routines")
      return [
        "feed",
        "sleep",
        "diapers",
        "routines",
        "activities",
        "growth",
        "health",
        "vaccines",
        "diversification",
      ].some((slug) => pathname.startsWith(`/enfant/${slug}`));
    if (href.endsWith("plus"))
      return (
        !items.slice(0, 4).some((item) => active(item.href)) &&
        !pathname.includes("/coach")
      );
    return pathname.startsWith(href);
  };
  return (
    <>
      <aside className="mt-sidebar" aria-label="Menu de la famille">
        <BrandMark />
        <p className="mt-sidebar-label">Notre petit monde</p>
        <nav aria-label="Navigation sur ordinateur">
          {items.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <Link
            href={inChild ? "/enfant/coach" : "/coach"}
            aria-current={pathname.endsWith("/coach") ? "page" : undefined}
          >
            <Sparkles size={18} />
            Un peu d’aide
          </Link>
          <Link href={inChild ? "/enfant/duo" : "/duo"}>
            <Users size={18} />
            Mes proches
          </Link>
        </nav>
        <div className="mt-sidebar-note">
          {older ? (
            <Sprout size={19} className="text-foreground-muted" />
          ) : (
            <Heart size={19} className="text-brand" />
          )}
          <p>
            Les petits moments
            <br />
            font les grandes histoires.
          </p>
          <Link href={inChild ? "/enfant/diary" : "/journal"}>
            Ajouter un souvenir <ArrowUpRight size={13} className="inline" />
          </Link>
        </div>
        <p className="mt-6 text-center text-[9px] text-foreground-subtle">
          MamaTrack · Grossesse → 6 ans
        </p>
      </aside>
      <nav className="mt-mobile-nav" aria-label="Navigation principale">
        <div>
          {items.map(({ href, mobile, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={active(href) ? 2.1 : 1.7} />
              <span>{mobile}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
