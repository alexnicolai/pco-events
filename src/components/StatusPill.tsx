import { PhoneIcon } from "@heroicons/react/24/solid";
import type { EventStatus } from "@/db/schema";

interface StatusPillProps {
  status: EventStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (status === "contacted") {
    return <PhoneIcon className={`h-5 w-5 text-[#9ca3af] shrink-0 ${className ?? ""}`} />;
  }
  return <PhoneIcon className={`h-5 w-5 text-[#f0932b] shrink-0 ${className ?? ""}`} />;
}
