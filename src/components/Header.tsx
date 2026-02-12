"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  lastSyncedAt?: string;
}

export function Header({ lastSyncedAt }: HeaderProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!syncError) return;
    const timer = setTimeout(() => setSyncError(null), 4000);
    return () => clearTimeout(timer);
  }, [syncError]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.status === 429) {
        const data = await res.json();
        setSyncError(data.message ?? "Rate limited — try again shortly.");
      } else if (!res.ok) {
        setSyncError("Sync failed");
      } else {
        router.refresh();
      }
    } catch {
      setSyncError("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">PCO Events</h1>
        <div className="flex items-center gap-2">
          {lastSyncedAt && (
            <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
              Synced {formatRelativeTime(lastSyncedAt)}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Sync events"
          >
            <svg
              className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>Sync</span>
          </button>
        </div>
      </div>
      {syncError && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-base text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <span>{syncError}</span>
            <button
              onClick={() => setSyncError(null)}
              className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
