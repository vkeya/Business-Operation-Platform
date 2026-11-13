
const DATE_FORMATTER_CACHE = new Map<
  string,
  Intl.DateTimeFormat
>();

function getFormatter(timezone: string) {
  let formatter = DATE_FORMATTER_CACHE.get(timezone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    DATE_FORMATTER_CACHE.set(timezone, formatter);
  }

  return formatter;
}

export function isValidTimezone(
  timezone: string,
): boolean {
  if (!timezone?.trim()) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    });

    return true;
  } catch {
    return false;
  }
}

export function assertValidTimezone(
  timezone: string,
): void {
  if (!isValidTimezone(timezone)) {
    throw new Error(
      `Invalid business timezone: ${timezone}`,
    );
  }
}

export function getLocalDateString(
  date: Date,
  timezone: string,
): string {
  assertValidTimezone(timezone);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date supplied.");
  }

  const parts = getFormatter(timezone)
    .formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function addCalendarDays(
  date: string,
  days: number,
): string {
  const parsed = parseLocalDate(date);

  parsed.setUTCDate(
    parsed.getUTCDate() + days,
  );

  return [
    parsed.getUTCFullYear(),
    String(parsed.getUTCMonth() + 1).padStart(2, "0"),
    String(parsed.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function parseLocalDate(
  value: string,
): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      "Date must use YYYY-MM-DD format.",
    );
  }

  const [year, month, day] =
    value.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid calendar date.");
  }

  return date;
}

/**
 * Converts business-local midnight into UTC.
 *
 * Uses iterative offset correction instead of assuming
 * a fixed UTC offset for the timezone.
 */
export function localMidnightToUtc(
  localDate: string,
  timezone: string,
): Date {
  assertValidTimezone(timezone);

  const calendarDate = parseLocalDate(localDate);

  const targetUtc = Date.UTC(
    calendarDate.getUTCFullYear(),
    calendarDate.getUTCMonth(),
    calendarDate.getUTCDate(),
  );

  let candidate = targetUtc;

  for (let attempt = 0; attempt < 4; attempt++) {
    const observedLocalDate =
      getLocalDateString(
        new Date(candidate),
        timezone,
      );

    if (observedLocalDate === localDate) {
      const parts = new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        },
      ).formatToParts(new Date(candidate));

      const time = Object.fromEntries(
        parts
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, Number(part.value)]),
      );

      if (
        time.hour === 0 &&
        time.minute === 0 &&
        time.second === 0
      ) {
        return new Date(candidate);
      }

      const elapsedSeconds =
        time.hour * 3600 +
        time.minute * 60 +
        time.second;

      candidate -= elapsedSeconds * 1000;
    } else {
      const observedUtc = Date.UTC(
        Number(observedLocalDate.slice(0, 4)),
        Number(observedLocalDate.slice(5, 7)) - 1,
        Number(observedLocalDate.slice(8, 10)),
      );

      candidate += targetUtc - observedUtc;
    }
  }

  throw new Error(
    `Could not resolve midnight for ${localDate} in ${timezone}.`,
  );
}
