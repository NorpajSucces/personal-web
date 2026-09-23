type ProjectStatus = "in_progress" | "completed";

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  timeZone: "UTC",
});

function formatPeriod(period: string) {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(period);
  if (!match) return null;

  const [, year, month] = match;
  if (!month) return year;

  const monthName = monthFormatter.format(
    new Date(Date.UTC(Number(year), Number(month) - 1, 1)),
  );
  return `${monthName} ${year}`;
}

export function formatProjectPeriod(
  startPeriod: string | null | undefined,
  endPeriod: string | null | undefined,
  projectStatus: ProjectStatus,
) {
  const startLabel = startPeriod ? formatPeriod(startPeriod) : null;
  const endLabel = endPeriod ? formatPeriod(endPeriod) : null;

  if (startLabel && endLabel) {
    if (startPeriod === endPeriod) return startLabel;

    const startParts = startPeriod?.split("-");
    const endParts = endPeriod?.split("-");
    if (
      startParts?.length === 2 &&
      endParts?.length === 2 &&
      startParts[0] === endParts[0]
    ) {
      const startMonth = monthFormatter.format(
        new Date(Date.UTC(Number(startParts[0]), Number(startParts[1]) - 1, 1)),
      );
      const endMonth = monthFormatter.format(
        new Date(Date.UTC(Number(endParts[0]), Number(endParts[1]) - 1, 1)),
      );
      return `${startMonth}–${endMonth} ${startParts[0]}`;
    }

    return `${startLabel}–${endLabel}`;
  }

  if (endLabel) return endLabel;
  if (!startLabel) return null;
  return projectStatus === "in_progress" ? `${startLabel}–Present` : startLabel;
}
