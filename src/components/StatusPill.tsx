import type { EventStatus } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<EventStatus, { label: string; variant: "secondary" | "outline" | "success" | "warning" }> = {
  not_contacted: {
    label: "Not Contacted",
    variant: "warning",
  },
  contacted: {
    label: "Contacted",
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
