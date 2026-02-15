"use client";

import { useState, useEffect } from "react";

interface FormattedDateProps {
  isoString: string;
  variant?: "short" | "long";
}

function formatDateTime(isoString: string, variant: "short" | "long"): string {
  const date = new Date(isoString);

  if (variant === "long") {
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function FormattedDate({ isoString, variant = "short" }: FormattedDateProps) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(formatDateTime(isoString, variant));
  }, [isoString, variant]);

  if (!formatted) return null;

  return <>{formatted}</>;
}
