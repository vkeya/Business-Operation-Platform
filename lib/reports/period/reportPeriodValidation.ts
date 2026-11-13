
import type {
  ReportPeriodInput,
} from "./reportPeriodTypes";

import {
  isValidTimezone,
  parseLocalDate,
} from "./reportTimezone";

const VALID_PRESETS = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
  "custom",
] as const;

export function validateReportPeriodInput(
  input: ReportPeriodInput,
  timezone: string,
): void {
  if (!isValidTimezone(timezone)) {
    throw new Error(
      "A valid business timezone is required.",
    );
  }

  if (
    !input ||
    !VALID_PRESETS.includes(
      input.preset as typeof VALID_PRESETS[number],
    )
  ) {
    throw new Error(
      "Invalid reporting period preset.",
    );
  }

  if (input.preset !== "custom") {
    return;
  }

  if (!input.startDate || !input.endDate) {
    throw new Error(
      "Custom reporting periods require a start date and end date.",
    );
  }

  const start = parseLocalDate(input.startDate);
  const end = parseLocalDate(input.endDate);

  if (start.getTime() > end.getTime()) {
    throw new Error(
      "The reporting start date cannot be after the end date.",
    );
  }

  const dayDifference =
    (end.getTime() - start.getTime()) /
    86_400_000;

  if (dayDifference > 365) {
    throw new Error(
      "Custom reporting periods cannot exceed 366 calendar days.",
    );
  }
}
