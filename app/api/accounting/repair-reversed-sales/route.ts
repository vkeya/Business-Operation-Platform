import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { reverseSaleAccounting } from "@/lib/accounting/posting/salesReversalPosting";
import { reversePaymentAccounting } from "@/lib/accounting/posting/paymentReversalPosting";

const CURRENT_BUSINESS_COOKIE = "teketeke_current_business";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const userId =
      typeof session?.user?.id === "string"
        ? session.user.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication is required." },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    const businessId = cookieStore.get(
      CURRENT_BUSINESS_COOKIE,
    )?.value;

    if (!businessId) {
      return NextResponse.json(
        { error: "No current business is selected." },
        { status: 400 },
      );
    }

    const membership =
      await prisma.businessMembership.findFirst({
        where: {
          userId,
          businessId,
          isOwner: true,
          isActive: true,
          business: {
            status: "ACTIVE",
          },
        },
        select: {
          businessId: true,
        },
      });

    if (!membership) {
      return NextResponse.json(
        { error: "Owner access is required." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const apply = body?.apply === true;

    const reversedSales = await prisma.sale.findMany({
      where: {
        businessId,
        status: "REVERSED",
      },
      include: {
        payments: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const results = [];

    for (const sale of reversedSales) {
      const saleReversalReference =
        `SALE-${sale.referenceNumber}-REVERSAL`;

      const existingSaleReversal =
        await prisma.journalEntry.findUnique({
          where: {
            businessId_reference: {
              businessId,
              reference: saleReversalReference,
            },
          },
          select: {
            id: true,
            reference: true,
          },
        });

      const paymentResults = [];

      for (const payment of sale.payments) {
        const paymentReversalReference =
          `PAY-${payment.reference}-REVERSAL`;

        const existingPaymentReversal =
          await prisma.journalEntry.findUnique({
            where: {
              businessId_reference: {
                businessId,
                reference: paymentReversalReference,
              },
            },
            select: {
              id: true,
              reference: true,
            },
          });

        paymentResults.push({
          paymentReference: payment.reference,
          reversalReference: paymentReversalReference,
          exists: Boolean(existingPaymentReversal),
        });

        if (apply && !existingPaymentReversal) {
          await reversePaymentAccounting({
            businessId,
            paymentReference: payment.reference,
            currency: payment.currency,
            createdBy: payment.createdBy,
          });
        }
      }

      if (apply && !existingSaleReversal) {
        await reverseSaleAccounting({
          businessId,
          saleId: sale.id,
          referenceNumber: sale.referenceNumber,
          totalAmount: Number(sale.totalAmount),
          currency: sale.currency,
          customerId: sale.customerId ?? undefined,
          createdBy: sale.createdBy,
        });
      }

      results.push({
        saleReference: sale.referenceNumber,
        amount: Number(sale.totalAmount),
        currency: sale.currency,
        saleReversalReference,
        saleReversalExists: Boolean(existingSaleReversal),
        payments: paymentResults,
      });
    }

    return NextResponse.json({
      success: true,
      mode: apply ? "APPLIED" : "PREVIEW",
      count: reversedSales.length,
      results,
    });
  } catch (error) {
    console.error(
      "Historical reversed-sale accounting repair failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to repair reversed-sale accounting.",
      },
      { status: 500 },
    );
  }
}