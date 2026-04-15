"use client";

import dynamic from "next/dynamic";
import { CommunitySkeleton } from "@/components/Skeleton";

const CommunityContent = dynamic(() => import("@/components/CommunityContent"), {
  loading: () => <CommunitySkeleton />,
  ssr: false,
});

export default function CommunautePage() {
  return <CommunityContent />;
}
