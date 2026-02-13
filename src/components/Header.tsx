"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        setSyncError(data.message ?? "Rate limited. Try again shortly.");
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
    <header className="sticky top-0 z-20 border-b border-divider bg-bg-primary">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
        <h1 className="text-[17px] font-semibold text-text-primary">PRC Events</h1>
        <div className="flex items-center gap-2">
          {lastSyncedAt && (
            <Badge variant="outline" className="hidden h-full border-0 sm:inline-flex">
              Synced {formatRelativeTime(lastSyncedAt)}
            </Badge>
          )}
          <Button onClick={handleSync} disabled={syncing} size="default" className="min-w-20 px-6">
            {syncing ? "Syncing..." : "Sync"}
          </Button>
        </div>
      </div>
      {syncError && (
        <div className="mx-auto max-w-2xl px-4 pb-2">
          <Alert variant="destructive" className="flex items-center justify-between gap-3">
            <span>{syncError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSyncError(null)}
              aria-label="Dismiss"
              className="h-8 px-2"
            >
              Close
            </Button>
          </Alert>
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
