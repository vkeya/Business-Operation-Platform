import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "Payment provider callback is not configured.",
    },
    { status: 501 },
  );
}