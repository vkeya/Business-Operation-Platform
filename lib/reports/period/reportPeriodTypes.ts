
export type ReportPeriodPreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export interface ReportPeriodInput {
  preset: ReportPeriodPreset;
  startDate?: string;
  endDate?: string;
}

export interface ResolvedReportPeriod {
  /**
   * Inclusive UTC start boundary.
   */
  startDate: Date;

  /**
   * Exclusive UTC end boundary.
   */
  endDateExclusive: Date;

  /**
   * Business IANA timezone.
   */
  timezone: string;

  /**
   * Business-local calendar start date (YYYY-MM-DD).
   */
  startDateLocal: string;

  /**
   * Exclusive business-local calendar end date (YYYY-MM-DD).
   */
  endDateLocalExclusive: string;
}
