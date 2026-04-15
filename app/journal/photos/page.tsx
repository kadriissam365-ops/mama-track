"use client";

import dynamic from "next/dynamic";
import { PhotosSkeleton } from "@/components/Skeleton";

const PhotosContent = dynamic(() => import("@/components/journal/PhotosContent"), {
  loading: () => <PhotosSkeleton />,
  ssr: false,
});

export default function PhotosPage() {
  return <PhotosContent />;
}
