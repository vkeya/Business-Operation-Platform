import { NextResponse } from "next/server";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { BusinessPermissionError } from "@/lib/business/businessPermissionService";
import { requireBusinessOperationAccess } from "@/lib/subscription/businessOperationAccessService";
import { SubscriptionEntitlementError } from "@/lib/subscription/subscriptionEntitlementService";
import {
  HospitalAccessError,
} from "@/lib/hospital/hospitalAccessService";
import {
  createHospitalInvoice,
  HospitalInvoiceError,
  listHospitalInvoices,
  type CreateHospitalInvoiceItemInput,
} from "@/lib/hospital/hospitalInvoiceService";

type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "VOID";

const invoiceStatuses: InvoiceStatus[] = [
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "VOID",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumericInput(value: unknown): value is number | string {
  return (
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function errorResponse(error: unknown, operation: string) {
  if (
    error instanceof BusinessPermissionError ||
    error instanceof SubscriptionEntitlementError ||
    error instanceof HospitalAccessError ||
    error instanceof HospitalInvoiceError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(`Hospital invoice ${operation} failed:`, error);
  return NextResponse.json(
    { error: `Unable to ${operation} hospital invoices.` },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.invoices.read",
    );

    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const statusParam = url.searchParams.get("status");
    const skipValue = Number(url.searchParams.get("skip") ?? 0);
    const takeValue = Number(url.searchParams.get("take") ?? 25);

    if (
      !Number.isInteger(skipValue) ||
      skipValue < 0 ||
      !Number.isInteger(takeValue) ||
      takeValue < 1 ||
      takeValue > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    if (
      statusParam !== null &&
      !invoiceStatuses.includes(statusParam as InvoiceStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid invoice status." },
        { status: 400 },
      );
    }

    const invoices = await listHospitalInvoices({
      ...(patientId ? { patientId } : {}),
      ...(search ? { search } : {}),
      ...(statusParam ? { status: statusParam as InvoiceStatus } : {}),
      skip: skipValue,
      take: takeValue,
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    return errorResponse(error, "load");
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusinessContext();

    await requireBusinessOperationAccess(
      context.user.id,
      context.business.id,
      "hospital.invoices.manage",
    );

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "A valid JSON invoice object is required." },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "A valid invoice object is required." },
        { status: 400 },
      );
    }

    if (
      typeof body.patientId !== "string" ||
      !body.patientId.trim() ||
      typeof body.currency !== "string" ||
      !body.currency.trim() ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Patient, currency, and at least one invoice item are required." },
        { status: 400 },
      );
    }

    if (
      body.notes !== undefined &&
      body.notes !== null &&
      typeof body.notes !== "string"
    ) {
      return NextResponse.json(
        { error: "Notes must be a string." },
        { status: 400 },
      );
    }

    let dueAt: Date | null | undefined;
    if (body.dueAt === null) {
      dueAt = null;
    } else if (body.dueAt !== undefined) {
      if (
        typeof body.dueAt !== "string" ||
        body.dueAt.trim() === "" ||
        Number.isNaN(Date.parse(body.dueAt))
      ) {
        return NextResponse.json(
          { error: "A valid due date is required." },
          { status: 400 },
        );
      }
      dueAt = new Date(body.dueAt);
    }

    const items: CreateHospitalInvoiceItemInput[] = [];
    for (let index = 0; index < body.items.length; index += 1) {
      const item = body.items[index];
      if (!isRecord(item)) {
        return NextResponse.json(
          { error: `Invoice item ${index + 1} must be an object.` },
          { status: 400 },
        );
      }

      if (
        typeof item.description !== "string" ||
        !item.description.trim() ||
        !isNumericInput(item.quantity) ||
        !isNumericInput(item.unitPrice) ||
        (item.discount !== undefined && !isNumericInput(item.discount)) ||
        (item.taxRate !== undefined && !isNumericInput(item.taxRate))
      ) {
        return NextResponse.json(
          {
            error: `Invoice item ${index + 1} requires a description, valid quantity and unit price; discount and tax rate must be numeric when supplied.`,
          },
          { status: 400 },
        );
      }

      items.push({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.discount !== undefined ? { discount: item.discount as number | string } : {}),
        ...(item.taxRate !== undefined ? { taxRate: item.taxRate as number | string } : {}),
      });
    }

    const invoice = await createHospitalInvoice({
      patientId: body.patientId,
      currency: body.currency,
      items,
      ...(typeof body.notes === "string" || body.notes === null
        ? { notes: body.notes }
        : {}),
      ...(dueAt !== undefined ? { dueAt } : {}),
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "create");
  }
}
