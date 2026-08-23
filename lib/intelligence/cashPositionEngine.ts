export type CashPositionStatus =
  | "HEALTHY"
  | "WATCH"
  | "CRITICAL";

export interface CashPositionInput {
  cashPosition: number;
  receivables: number;
  payables: number;
}

export interface CashPositionInsight {
  status: CashPositionStatus;
  title: string;
  message: string;
  recommendation: string;
}

export function getCashPositionInsight({
  cashPosition,
  receivables,
  payables,
}: CashPositionInput): CashPositionInsight {
  const availableCash = Math.max(cashPosition, 0);
  const obligations = Math.max(payables, 0);

  if (availableCash <= 0 && obligations > 0) {
    return {
      status: "CRITICAL",
      title: "Cash position needs attention",
      message:
        "Your current cash position does not cover outstanding supplier obligations.",
      recommendation:
        "Review upcoming payments and outstanding customer receivables.",
    };
  }

  if (obligations > availableCash) {
    return {
      status: "WATCH",
      title: "Cash position under pressure",
      message:
        "Outstanding supplier obligations are higher than your current cash position.",
      recommendation:
        "Prioritize upcoming payments and follow up on customer receivables.",
    };
  }

  if (availableCash === 0 && receivables > 0) {
    return {
      status: "WATCH",
      title: "Cash position needs attention",
      message:
        "You currently have no positive cash position, although customers owe you money.",
      recommendation:
        "Follow up on outstanding customer receivables to improve cash availability.",
    };
  }

  return {
    status: "HEALTHY",
    title: "Cash position is healthy",
    message:
      "Your current cash position covers outstanding supplier obligations.",
    recommendation:
      "Continue monitoring cash inflows, customer receivables, and upcoming payments.",
  };
}