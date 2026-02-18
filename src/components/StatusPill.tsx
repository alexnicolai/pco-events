import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import type { EventStatus } from "@/db/schema";

interface StatusPillProps {
  status: EventStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  if (status === "contacted") {
    return <CheckCircleIcon className={`h-6 w-6 text-[#31a24c] shrink-0 ${className ?? ""}`} />;
  }
  return <QuestionMarkCircleIcon className={`h-6 w-6 text-[#f0932b] shrink-0 ${className ?? ""}`} />;
}
