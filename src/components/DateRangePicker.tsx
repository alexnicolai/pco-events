"use client";

import { SelectField } from "@/components/ui/select-field";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <SelectField value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="this_month">This month</option>
      <option value="this_year">This year</option>
    </SelectField>
  );
}
