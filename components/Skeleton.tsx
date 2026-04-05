"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 rounded-xl ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Hero Card Skeleton */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 shadow-sm border border-pink-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-14 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
      </div>

      {/* Trimester badges */}
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-10 rounded-2xl" />
        <Skeleton className="flex-1 h-10 rounded-2xl" />
        <Skeleton className="flex-1 h-10 rounded-2xl" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-pink-100 flex items-center gap-3"
        >
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrackingSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Tabs */}
      <Skeleton className="h-12 w-full rounded-2xl" />
      
      {/* Button */}
      <Skeleton className="h-12 w-full rounded-2xl" />
      
      {/* Chart */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      
      {/* List */}
      <ListSkeleton count={3} />
    </div>
  );
}

export function ChecklistSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      
      {/* Progress */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      
      {/* Categories */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-pink-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
