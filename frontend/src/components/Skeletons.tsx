"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 bg-secondary" />
          <Skeleton className="h-3 w-72 bg-secondary mt-2" />
        </div>
        <Skeleton className="h-4 w-40 bg-secondary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg bg-secondary" />
        ))}
      </div>
      <Skeleton className="h-10 rounded-lg bg-secondary" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-64 rounded-lg bg-secondary" />
        <Skeleton className="h-64 rounded-lg bg-secondary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-lg bg-secondary" />
        ))}
      </div>
    </div>
  );
}

export function CustomerListSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Skeleton className="h-[26rem] rounded-[2.5rem] bg-secondary/80" />
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[38rem] rounded-[2rem] bg-secondary/80" />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-6 w-40 bg-secondary" />
          <Skeleton className="h-3 w-24 bg-secondary mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 bg-secondary rounded-md" />
          <Skeleton className="h-8 w-24 bg-secondary rounded-md" />
        </div>
      </div>
      <Skeleton className="h-14 rounded-lg bg-primary/5" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg bg-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-56 rounded-lg bg-secondary" />
        <Skeleton className="h-56 rounded-lg bg-secondary" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-lg bg-secondary" />
        <Skeleton className="h-64 rounded-lg bg-secondary" />
      </div>
    </div>
  );
}

export function LogsSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-6 w-56 bg-secondary" />
          <Skeleton className="h-3 w-32 bg-secondary mt-2" />
        </div>
        <Skeleton className="h-8 w-28 bg-secondary rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-lg bg-secondary" />
        <Skeleton className="h-48 rounded-lg bg-secondary" />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded bg-secondary" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg bg-secondary" />
    </div>
  );
}

export function ModelsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-36 bg-secondary" />
          <Skeleton className="h-3 w-64 bg-secondary mt-2" />
        </div>
        <Skeleton className="h-4 w-32 bg-secondary" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg bg-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-lg bg-secondary" />
        ))}
      </div>
    </div>
  );
}

export function PlaygroundSkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <Skeleton className="h-6 w-28 bg-secondary" />
        <Skeleton className="h-3 w-48 bg-secondary mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-36 rounded-lg bg-secondary" />
          <Skeleton className="h-44 rounded-lg bg-secondary" />
          <Skeleton className="h-36 rounded-lg bg-secondary" />
        </div>
        <div className="lg:col-span-8">
          <Skeleton className="h-64 rounded-lg bg-secondary" />
        </div>
      </div>
    </div>
  );
}
