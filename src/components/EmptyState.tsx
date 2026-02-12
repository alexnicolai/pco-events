interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = "No events found",
  message = "Try adjusting your filters or check back later.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
        <svg
          className="h-9 w-9 text-zinc-400"
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
      <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
