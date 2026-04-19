import { PhoneIcon } from "@heroicons/react/24/solid";
import type { EventStatus } from "@/db/schema";

interface StatusPillProps {
  status: EventStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (status === "contacted") {
    return <PhoneIcon className={`h-6 w-6 text-[#8a8d91] shrink-0 ${className ?? ""}`} />;
  }
  return <PhoneIcon className={`h-6 w-6 text-[#f0932b] shrink-0 ${className ?? ""}`} />;
}
