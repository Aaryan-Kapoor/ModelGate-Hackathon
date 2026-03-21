"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-10 w-64 bg-surface rounded-md" />
          <Skeleton className="h-5 w-96 bg-surface mt-3 rounded-md" />
        </div>
        <Skeleton className="h-10 w-48 bg-surface rounded-full" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-8 border-y border-border/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4">
            <Skeleton className="h-3 w-24 bg-surface mb-3 rounded" />
            <Skeleton className="h-8 w-32 bg-surface rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-[300px] rounded-2xl bg-surface/50" />
        <Skeleton className="h-[300px] rounded-2xl bg-surface/50" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-border/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[250px] rounded-2xl bg-surface/50" />
        ))}
      </div>
    </div>
  );
}

export function CustomerListSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-10 w-48 bg-surface rounded-md" />
          <Skeleton className="h-5 w-72 bg-surface mt-3 rounded-md" />
        </div>
        <Skeleton className="h-12 w-48 bg-surface rounded-md" />
      </div>
      <div className="bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-6 border-b border-border/50">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48 bg-surface rounded" />
              <Skeleton className="h-4 w-64 bg-surface rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 bg-surface rounded" />
              <Skeleton className="h-6 w-24 bg-surface rounded" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-10 w-16 bg-surface rounded" />
              <Skeleton className="h-10 w-20 bg-surface rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-64 bg-surface rounded-md" />
          <Skeleton className="h-4 w-32 bg-surface mt-3 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 bg-surface rounded-md" />
          <Skeleton className="h-10 w-32 bg-surface rounded-md" />
        </div>
      </div>
      <Skeleton className="h-20 rounded-2xl bg-surface/50" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-surface/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl bg-surface/50" />
        <Skeleton className="h-72 rounded-2xl bg-surface/50" />
      </div>
    </div>
  );
}

export function LogsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-surface rounded-md" />
          <Skeleton className="h-4 w-64 bg-surface mt-3 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 bg-surface rounded-md" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded bg-surface" />
        ))}
      </div>
      <Skeleton className="h-[600px] rounded-2xl bg-surface/50" />
    </div>
  );
}

export function ModelsSkeleton() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6">
        <Skeleton className="h-10 w-48 bg-surface rounded-md" />
        <Skeleton className="h-5 w-96 bg-surface mt-3 rounded-md" />
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <Skeleton className="h-full rounded-2xl bg-surface/30" />
        <Skeleton className="h-full rounded-2xl bg-surface/30" />
      </div>
    </div>
  );
}

export function PlaygroundSkeleton() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6">
        <Skeleton className="h-10 w-48 bg-surface rounded-md" />
        <Skeleton className="h-5 w-96 bg-surface mt-3 rounded-md" />
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-32 rounded-2xl bg-surface/50" />
          <Skeleton className="h-48 rounded-2xl bg-surface/50" />
          <Skeleton className="h-40 rounded-2xl bg-surface/50 mt-auto" />
        </div>
        <div className="lg:col-span-8">
          <Skeleton className="h-full rounded-2xl bg-surface/30" />
        </div>
      </div>
    </div>
  );
}
