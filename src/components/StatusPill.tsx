import type { EventStatus } from "@/db/schema";

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  not_contacted: {
    label: "Not Contacted",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
};

interface StatusPillProps {
  status: EventStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
