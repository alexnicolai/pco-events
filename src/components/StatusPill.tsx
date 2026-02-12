import type { EventStatus } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<EventStatus, { label: string; variant: "secondary" | "outline" | "success" }> = {
  not_contacted: {
    label: "Not Contacted",
    variant: "secondary",
  },
  contacted: {
    label: "Contacted",
    variant: "outline",
  },
  completed: {
    label: "Completed",
    variant: "success",
  },
};

interface StatusPillProps {
  status: EventStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
