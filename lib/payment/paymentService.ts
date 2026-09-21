import {
  paymentRepository,
  type CreatePurchasePaymentInput,
  type CreateSalePaymentInput,
} from "./paymentRepository";
import { postPaymentToAccounting } from "@/lib/accounting/posting/paymentPosting";
import {
  generateBusinessReference,
} from "@/lib/business/reference/referenceGenerator";
import { prisma } from "@/lib/database/prisma";

type PrismaTransactionClient =
  Parameters<typeof prisma.$transaction>[0] extends (
    client: infer T,
  ) => unknown
    ? T
    : never;

async function findExistingPurchasePaymentOperation(
  input: CreatePurchasePaymentInput,
) {
  return prisma.operationRequest.findUnique({
    where: {
      businessId_operationId: {
        businessId:
          input.businessId,
        operationId:
          input.operationId,
      },
    },
  });
}

async function createSalePaymentWithTx(
  tx: PrismaTransactionClient,
  input: CreateSalePaymentInput,
) {
  const operation =
    await tx.operationRequest.create({
      data: {
        businessId:
          input.businessId,
        operationId:
          input.operationId,
        operation:
          "SALE_PAYMENT",
        status:
          "PROCESSING",
        entityType:
          "SALE",
        entityId:
          input.saleId,
        createdBy:
          input.createdBy,
      },
    });

  const sale =
    await paymentRepository.findSaleWithPayments(
      input.businessId,
      input.saleId,
      tx,
    );

  if (!sale) {
    throw new Error(
      "Sale not found.",
    );
  }

  const paidAmount =
    sale.payments.reduce(
      (total, payment) =>
        total + payment.amount.toNumber(),
      0,
    );

  const outstandingAmount =
    sale.totalAmount.toNumber() -
    paidAmount;

  if (outstandingAmount <= 0) {
    throw new Error(
      "This sale has already been fully paid.",
    );
  }

  if (input.amount > outstandingAmount) {
    throw new Error(
      "Payment amount exceeds the outstanding sale balance.",
    );
  }

  const newPaidAmount =
    paidAmount + input.amount;

  const paymentStatus =
    newPaidAmount >=
    sale.totalAmount.toNumber()
      ? "PAID"
      : "PARTIAL";

  const reference =
    input.reference?.trim() ||
    await generateBusinessReference({
      businessId:
        input.businessId,
      referenceType:
        "PAYMENT",
      prefix: "PAY",
      client: tx,
    });

  const payment =
    await paymentRepository.createSalePayment(
      {
        ...input,
        reference,
        method:
          input.method,
        currency:
          input.currency.trim(),
      },
      tx,
    );

  await paymentRepository.updateSalePaymentStatus(
    input.businessId,
    input.saleId,
    paymentStatus,
    tx,
  );

  await postPaymentToAccounting({
    businessId:
      payment.businessId,
    paymentId:
      payment.id,
    reference:
      payment.reference,
    amount:
      Number(payment.amount),
    currency:
      payment.currency,
    createdBy:
      payment.createdBy,
    type:
      "SALE",
    paymentMethod:
      input.method === "MPESA"
        ? "MPESA"
        : input.method === "CARD"
          ? "CARD"
          : input.method === "BANK"
            ? "BANK"
            : input.method === "CASH"
              ? "CASH"
              : undefined,
    client:
      tx,
  });

  await tx.operationRequest.update({
    where: {
      id:
        operation.id,
    },
    data: {
      status:
        "COMPLETED",
      entityType:
        "PAYMENT",
      entityId:
        payment.id,
      response: {
        paymentId:
          payment.id,
        saleId:
          input.saleId,
      },
    },
  });

  return payment;
}

export const paymentService = {
      async createPurchasePayment(
    input: CreatePurchasePaymentInput,
  ) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }

    if (!input.operationId?.trim()) {
      throw new Error(
        "Payment operation ID is required.",
      );
    }

    if (!input.method.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    if (input.amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }

    if (!input.currency.trim()) {
      throw new Error(
        "Payment currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const operation =
              await tx.operationRequest.create({
                data: {
                  businessId:
                    input.businessId,
                  operationId:
                    input.operationId,
                  operation:
                    "PURCHASE_PAYMENT",
                  status:
                    "PROCESSING",
                  entityType:
                    "PURCHASE",
                  entityId:
                    input.purchaseId,
                  createdBy:
                    input.createdBy,
                },
              });

            const purchase =
              await paymentRepository.findPurchaseWithPayments(
                input.businessId,
                input.purchaseId,
                tx,
              );

            if (!purchase) {
              throw new Error(
                "Purchase not found.",
              );
            }

            const paidAmount =
              purchase.payments.reduce(
                (total, payment) =>
                  total +
                  payment.amount.toNumber(),
                0,
              );

            const outstandingAmount =
              purchase.totalAmount.toNumber() -
              paidAmount;

            if (outstandingAmount <= 0) {
              throw new Error(
                "This purchase has already been fully paid.",
              );
            }

            if (
              input.amount >
              outstandingAmount
            ) {
              throw new Error(
                "Payment amount exceeds the outstanding purchase balance.",
              );
            }

            const newPaidAmount =
              paidAmount +
              input.amount;

            const paymentStatus =
              newPaidAmount >=
              purchase.totalAmount.toNumber()
                ? "PAID"
                : "PARTIAL";

            const reference =
              input.reference?.trim() ||
              await generateBusinessReference({
                businessId:
                  input.businessId,
                referenceType:
                  "PAYMENT",
                prefix: "PAY",
              });

            const payment =
              await paymentRepository.createPurchasePayment(
                {
                  ...input,
                  reference,
                  method:
                    input.method,
                  currency:
                    input.currency.trim(),
                },
                tx,
              );

            await paymentRepository.updatePurchasePaymentStatus(
              input.businessId,
              input.purchaseId,
              paymentStatus,
              tx,
            );

            await postPaymentToAccounting({
              businessId:
                payment.businessId,
              paymentId:
                payment.id,
              reference:
                payment.reference,
              amount:
                payment.amount,
              currency:
                payment.currency,
              createdBy:
                payment.createdBy,
              type:
                "PURCHASE",
              client:
                tx,
            });

            await tx.operationRequest.update({
              where: {
                id: operation.id,
              },
              data: {
                status:
                  "COMPLETED",
                entityType:
                  "PAYMENT",
                entityId:
                  payment.id,
                response: {
                  paymentId:
                    payment.id,
                  purchaseId:
                    input.purchaseId,
                },
              },
            });

            return payment;
          },
          {
            isolationLevel:
              "Serializable",
          },
        );
      } catch (error: unknown) {
        const errorCode =
          typeof error === "object" &&
          error !== null &&
          "code" in error
            ? (error as {
                code?: string;
              }).code
            : undefined;

        if (
          errorCode === "P2034" &&
          attempt < maxAttempts
        ) {
          continue;
        }

        if (errorCode !== "P2002") {
          throw error;
        }

        const existingOperation =
          await findExistingPurchasePaymentOperation(
            input,
          );

        if (!existingOperation) {
          throw error;
        }

        if (!existingOperation.entityId) {
          throw new Error(
            "This purchase payment operation is already being processed.",
          );
        }

        const existingPayment =
          await paymentRepository.findById(
            input.businessId,
            existingOperation.entityId,
          );

        if (existingPayment) {
          return existingPayment;
        }

        throw new Error(
          "This purchase payment operation is already being processed.",
        );
      }
    }

    throw new Error(
      "Unable to complete purchase payment after multiple concurrent attempts.",
    );
  },


  async listPurchasePayments(
    businessId: string,
    purchaseId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!purchaseId) {
      throw new Error(
        "Purchase is required.",
      );
    }

    return paymentRepository.listPurchasePayments(
      businessId,
      purchaseId,
    );
  },

 async createSalePayment(
  input: CreateSalePaymentInput,
  client?: PrismaTransactionClient,
) {
    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!input.saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

	if (!input.operationId?.trim()) {
  throw new Error(
    "Payment operation ID is required.",
  );
}

    if (!input.method.trim()) {
      throw new Error(
        "Payment method is required.",
      );
    }

    if (input.amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }

    if (!input.currency.trim()) {
      throw new Error(
        "Payment currency is required.",
      );
    }

    if (!input.createdBy) {
      throw new Error(
        "User context is required.",
      );
    }

        if (client) {
      return createSalePaymentWithTx(
        client,
        input,
      );
    }

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await prisma.$transaction(
          async (tx) =>
            createSalePaymentWithTx(
              tx,
              input,
            ),
          {
            isolationLevel:
              "Serializable",
          },
        );
      } catch (error: unknown) {
        const errorCode =
          typeof error === "object" &&
          error !== null &&
          "code" in error
            ? (
                error as {
                  code?: string;
                }
              ).code
            : undefined;

        if (
          errorCode === "P2034" &&
          attempt < maxAttempts
        ) {
          continue;
        }

        if (errorCode !== "P2002") {
          throw error;
        }

        const existingOperation =
          await prisma.operationRequest.findUnique({
            where: {
              businessId_operationId: {
                businessId:
                  input.businessId,
                operationId:
                  input.operationId,
              },
            },
          });

        if (!existingOperation) {
          throw error;
        }

        if (!existingOperation.entityId) {
          throw new Error(
            "This sale payment operation is already being processed.",
          );
        }

        const existingPayment =
          await paymentRepository.findById(
            input.businessId,
            existingOperation.entityId,
          );

        if (existingPayment) {
          return existingPayment;
        }

        throw new Error(
          "This sale payment operation is already being processed.",
        );
      }
    }

    throw new Error(
      "Unable to complete sale payment after multiple concurrent attempts.",
    );
  },

  async listSalePayments(
    businessId: string,
    saleId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!saleId) {
      throw new Error(
        "Sale is required.",
      );
    }

    return paymentRepository.listSalePayments(
      businessId,
      saleId,
    );
  },
};