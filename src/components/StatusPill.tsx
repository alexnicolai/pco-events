import { CheckCircleIcon } from "@heroicons/react/24/solid";
import type { EventStatus } from "@/db/schema";

interface StatusPillProps {
  status: EventStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (status === "contacted") {
    return <CheckCircleIcon className={`h-6 w-6 text-[#8a8d91] shrink-0 ${className ?? ""}`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 shrink-0 rounded-full border-2 border-[#8a8d91] ${className ?? ""}`}
    />
  );
}
