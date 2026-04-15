"use client";

import dynamic from "next/dynamic";
import { NotesSkeleton } from "@/components/Skeleton";

const NotesContent = dynamic(() => import("@/components/journal/NotesContent"), {
  loading: () => <NotesSkeleton />,
  ssr: false,
});

export default function NotesPage() {
  return <NotesContent />;
}
