export function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  current: boolean | null,
): string | null {
  const start = hasText(startDate) ? startDate.trim() : null;
  const end = current ? "Present" : hasText(endDate) ? endDate.trim() : null;

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start ?? end;
}
