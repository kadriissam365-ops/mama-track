"use client";

import dynamic from "next/dynamic";
import { GalerieSkeleton } from "@/components/Skeleton";

const GalerieContent = dynamic(() => import("@/components/journal/GalerieContent"), {
  loading: () => <GalerieSkeleton />,
  ssr: false,
});

export default function GaleriePage() {
  return <GalerieContent />;
}
