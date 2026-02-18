import { CalendarIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = "No events found",
  message = "Try adjusting your filters or check back later.",
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-4 py-10 text-center sm:py-14">
        <div className="mb-4 rounded-full bg-bg-secondary p-4" aria-hidden>
          <CalendarIcon className="h-8 w-8 text-text-tertiary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 max-w-sm text-base text-text-secondary">{message}</p>
      </CardContent>
    </Card>
  );
}
