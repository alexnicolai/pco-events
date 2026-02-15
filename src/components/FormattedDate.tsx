import { formatEventDate, type DateVariant } from "@/lib/dates";

interface FormattedDateProps {
  isoString: string;
  variant?: DateVariant;
}

export function FormattedDate({ isoString, variant = "short" }: FormattedDateProps) {
  return <>{formatEventDate(isoString, variant)}</>;
}
