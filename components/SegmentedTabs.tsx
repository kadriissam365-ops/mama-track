"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { m as motion } from "framer-motion";

export interface SegmentedTabItem<T extends string> {
  id: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  items: readonly SegmentedTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Libellé du groupe pour les lecteurs d'écran. */
  ariaLabel: string;
  className?: string;
}

/**
 * Barre d'onglets défilante avec indicateur mesuré sur la position réelle de
 * l'onglet actif (les libellés ont des largeurs différentes : un indicateur
 * calculé en `100 / n %` se décale dès le deuxième onglet).
 *
 * Gère aussi le défilement automatique vers l'onglet sélectionné et la
 * navigation au clavier (flèches / Début / Fin), conformément au motif ARIA "tabs".
 */
export default function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className = "",
}: SegmentedTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    const active = tabRefs.current.get(value);
    if (!list || !active) return;
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, [value]);

  useLayoutEffect(() => {
    measure();
  }, [measure, items.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    for (const el of tabRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    // Garde l'onglet actif visible quand la barre déborde horizontalement.
    tabRefs.current.get(value)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [value]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = items.findIndex((t) => t.id === value);
    if (index === -1) return;
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    const id = items[next].id;
    onChange(id);
    tabRefs.current.get(id)?.focus();
  };

  return (
    <div className={`relative overflow-x-auto scrollbar-hide ${className}`}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className="relative flex gap-1 bg-pink-50 dark:bg-pink-950/30 rounded-2xl p-1"
        style={{ minWidth: "max-content" }}
      >
        {indicator && (
          <motion.span
            aria-hidden
            className="absolute top-1 bottom-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
            initial={false}
            animate={{ left: indicator.left, width: indicator.width }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
        {items.map((tab) => {
          const active = tab.id === value;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={`relative z-10 flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-3 text-xs font-medium transition-colors ${
                active
                  ? "text-pink-700 dark:text-pink-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
