import { describe, it, expect } from "vitest";
import { formatEventDate } from "./dates";

describe("formatEventDate", () => {
  // The event is at 3:30 PM Eastern on Sat Feb 21, 2026.
  // In UTC that is 2026-02-21T20:30:00Z (EST = UTC-5 in February).

  const UTC_ISO = "2026-02-21T20:30:00Z";
  const OFFSET_ISO = "2026-02-21T15:30:00-05:00";
  const BARE_ISO = "2026-02-21T20:30:00"; // no timezone — the problematic case

  it("formats UTC date (short)", () => {
    const result = formatEventDate(UTC_ISO, "short");
    expect(result).toContain("Feb");
    expect(result).toContain("21");
    expect(result).toMatch(/3:30\s*PM/i);
  });

  it("formats offset date (short)", () => {
    const result = formatEventDate(OFFSET_ISO, "short");
    expect(result).toMatch(/3:30\s*PM/i);
  });

  it("formats bare date (short) — treated as UTC, not local time", () => {
    const result = formatEventDate(BARE_ISO, "short");
    // Without the normalisation fix this would show 8:30 PM in a UTC+0 server
    // or a different time depending on the host timezone.
    expect(result).toMatch(/3:30\s*PM/i);
  });

  it("formats UTC date (long)", () => {
    const result = formatEventDate(UTC_ISO, "long");
    expect(result).toContain("February");
    expect(result).toContain("2026");
    expect(result).toMatch(/3:30\s*PM/i);
  });

  it("formats offset date (long)", () => {
    const result = formatEventDate(OFFSET_ISO, "long");
    expect(result).toMatch(/3:30\s*PM/i);
  });

  it("formats bare date (long) — treated as UTC, not local time", () => {
    const result = formatEventDate(BARE_ISO, "long");
    expect(result).toMatch(/3:30\s*PM/i);
  });

  it("produces identical time for all three input formats (short)", () => {
    const a = formatEventDate(UTC_ISO, "short");
    const b = formatEventDate(OFFSET_ISO, "short");
    const c = formatEventDate(BARE_ISO, "short");
    expect(a).toBe(b);
    expect(a).toBe(c);
  });

  it("produces identical time for all three input formats (long)", () => {
    const a = formatEventDate(UTC_ISO, "long");
    const b = formatEventDate(OFFSET_ISO, "long");
    const c = formatEventDate(BARE_ISO, "long");
    expect(a).toBe(b);
    expect(a).toBe(c);
  });

  it("defaults to short variant", () => {
    const explicit = formatEventDate(UTC_ISO, "short");
    const defaulted = formatEventDate(UTC_ISO);
    expect(explicit).toBe(defaulted);
  });
});
