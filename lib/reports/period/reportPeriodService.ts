
import type {
  ReportPeriodInput,
  ResolvedReportPeriod,
} from "./reportPeriodTypes";

import {
  addCalendarDays,
  getLocalDateString,
  localMidnightToUtc,
} from "./reportTimezone";

import {
  validateReportPeriodInput,
} from "./reportPeriodValidation";

function getMonthStart(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

function getYearStart(date: string): string {
  return `${date.slice(0, 4)}-01-01`;
}

function resolveLocalDates(
  input: ReportPeriodInput,
  today: string,
): {
  startDateLocal: string;
  endDateLocalExclusive: string;
} {
  switch (input.preset) {
    case "today":
      return {
        startDateLocal: today,
        endDateLocalExclusive:
          addCalendarDays(today, 1),
      };

    case "yesterday": {
      const yesterday = addCalendarDays(today, -1);

      return {
        startDateLocal: yesterday,
        endDateLocalExclusive: today,
      };
    }

    case "this_week": {
      const current = new Date(`${today}T00:00:00.000Z`);
      const day = current.getUTCDay();
      const daysSinceMonday = (day + 6) % 7;
      const monday = addCalendarDays(
        today,
        -daysSinceMonday,
      );

      return {
        startDateLocal: monday,
        endDateLocalExclusive:
          addCalendarDays(today, 1),
      };
    }

    case "last_week": {
      const current = new Date(`${today}T00:00:00.000Z`);
      const day = current.getUTCDay();
      const daysSinceMonday = (day + 6) % 7;

      const thisMonday = addCalendarDays(
        today,
        -daysSinceMonday,
      );

      const lastMonday = addCalendarDays(
        thisMonday,
        -7,
      );

      return {
        startDateLocal: lastMonday,
        endDateLocalExclusive: thisMonday,
      };
    }

    case "this_month":
      return {
        startDateLocal: getMonthStart(today),
        endDateLocalExclusive:
          addCalendarDays(today, 1),
      };

    case "last_month": {
      const thisMonth = getMonthStart(today);

      const lastMonthEnd = thisMonth;
      const lastMonthStart = addCalendarDays(
        thisMonth,
        -1,
      );

      return {
        startDateLocal: getMonthStart(lastMonthStart),
        endDateLocalExclusive: lastMonthEnd,
      };
    }

    case "this_year":
      return {
        startDateLocal: getYearStart(today),
        endDateLocalExclusive:
          addCalendarDays(today, 1),
      };

    case "custom":
      return {
        startDateLocal: input.startDate!,
        endDateLocalExclusive:
          addCalendarDays(input.endDate!, 1),
      };
  }
}

export function resolveReportPeriod(
  input: ReportPeriodInput,
  timezone: string,
  now: Date = new Date(),
): ResolvedReportPeriod {
  validateReportPeriodInput(input, timezone);

  if (Number.isNaN(now.getTime())) {
    throw new Error("Invalid reference date.");
  }

  const today = getLocalDateString(now, timezone);

  const {
    startDateLocal,
    endDateLocalExclusive,
  } = resolveLocalDates(input, today);

  return {
    startDate: localMidnightToUtc(
      startDateLocal,
      timezone,
    ),

    endDateExclusive: localMidnightToUtc(
      endDateLocalExclusive,
      timezone,
    ),

    timezone,
    startDateLocal,
    endDateLocalExclusive,
  };
}
