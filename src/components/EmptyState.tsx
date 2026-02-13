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
          <svg
            className="h-8 w-8 text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 max-w-sm text-base text-text-secondary">{message}</p>
      </CardContent>
    </Card>
  );
}
