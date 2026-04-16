"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30 space-y-3">
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
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/20 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-pink-900/30">
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
          className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-pink-100 dark:border-pink-900/30 flex items-center gap-3"
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      
      {/* List */}
      <ListSkeleton count={3} />
    </div>
  );
}

export function PhotosSkeleton() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="w-4 h-4 rounded-full mt-3 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GalerieSkeleton() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full rounded-2xl" style={{ aspectRatio: "1/1" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-2xl mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-12 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-pink-100 dark:border-pink-900/30">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      
      {/* Categories */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-pink-100 dark:border-pink-900/30 overflow-hidden">
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
