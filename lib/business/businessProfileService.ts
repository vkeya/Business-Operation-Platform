
import { prisma } from "@/lib/database/prisma";
import { recordAuditEvent } from "@/lib/audit/auditService";
import { AUDIT_ACTIONS } from "@/lib/audit/auditActions";

export interface BusinessProfileInput {
  name?: string;
  legalName?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxRegistrationNumber?: string | null;
  receiptFooter?: string | null;
}

export class BusinessProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessProfileValidationError";
  }
}

const profileFields = [
  "name",
  "legalName",
  "logoUrl",
  "phone",
  "email",
  "address",
  "taxRegistrationNumber",
  "receiptFooter",
] as const;

function normalizeOptionalString(
  value: unknown,
  field: string,
  maxLength: number,
): string | null {
  if (value === null) return null;

  if (typeof value !== "string") {
    throw new BusinessProfileValidationError(
      `${field} must be a string or null.`,
    );
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new BusinessProfileValidationError(
      `${field} cannot exceed ${maxLength} characters.`,
    );
  }

  return normalized || null;
}

function parseProfileInput(input: unknown): BusinessProfileInput {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    throw new BusinessProfileValidationError(
      "A valid business profile object is required.",
    );
  }

  const record = input as Record<string, unknown>;
  const keys = Object.keys(record);

  if (keys.length === 0) {
    throw new BusinessProfileValidationError(
      "At least one profile field must be provided.",
    );
  }

  for (const key of keys) {
    if (!profileFields.includes(key as (typeof profileFields)[number])) {
      throw new BusinessProfileValidationError(
        `Unsupported business profile field: ${key}`,
      );
    }
  }

  return record as BusinessProfileInput;
}

export const businessProfileService = {
  async getProfile(businessId: string) {
    return prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        legalName: true,
        logoUrl: true,
        phone: true,
        email: true,
        address: true,
        taxRegistrationNumber: true,
        receiptFooter: true,
        country: true,
        baseCurrency: true,
      },
    });
  },

  async updateProfile(
    businessId: string,
    actorId: string,
    rawInput: unknown,
  ) {
    if (!businessId || !actorId) {
      throw new BusinessProfileValidationError(
        "Business and user context are required.",
      );
    }

    const input = parseProfileInput(rawInput);

    const data: {
      name?: string;
      legalName?: string | null;
      logoUrl?: string | null;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      taxRegistrationNumber?: string | null;
      receiptFooter?: string | null;
    } = {};

    if (input.name !== undefined) {
      const name = normalizeOptionalString(
        input.name,
        "Business name",
        160,
      );

      if (!name) {
        throw new BusinessProfileValidationError(
          "Business name is required.",
        );
      }

      data.name = name;
    }

    if (input.legalName !== undefined) {
      data.legalName = normalizeOptionalString(
        input.legalName,
        "Legal name",
        200,
      );
    }

    if (input.logoUrl !== undefined) {
      const logoUrl = normalizeOptionalString(
        input.logoUrl,
        "Logo URL",
        2048,
      );

      if (logoUrl) {
        let parsedUrl: URL;

        try {
          parsedUrl = new URL(logoUrl);
        } catch {
          throw new BusinessProfileValidationError(
            "Logo URL must be a valid absolute HTTP or HTTPS URL.",
          );
        }

        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          throw new BusinessProfileValidationError(
            "Logo URL must use HTTP or HTTPS.",
          );
        }
      }

      data.logoUrl = logoUrl;
    }

    if (input.phone !== undefined) {
      data.phone = normalizeOptionalString(
        input.phone,
        "Phone",
        40,
      );
    }

    if (input.email !== undefined) {
      const email = normalizeOptionalString(
        input.email,
        "Email",
        254,
      );

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        throw new BusinessProfileValidationError(
          "Enter a valid email address.",
        );
      }

      data.email = email;
    }

    if (input.address !== undefined) {
      data.address = normalizeOptionalString(
        input.address,
        "Address",
        500,
      );
    }

    if (input.taxRegistrationNumber !== undefined) {
      data.taxRegistrationNumber = normalizeOptionalString(
        input.taxRegistrationNumber,
        "Tax registration number",
        100,
      );
    }

    if (input.receiptFooter !== undefined) {
      data.receiptFooter = normalizeOptionalString(
        input.receiptFooter,
        "Receipt footer",
        500,
      );
    }

    return prisma.$transaction(async (tx) => {
      const before = await tx.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          name: true,
          legalName: true,
          logoUrl: true,
          phone: true,
          email: true,
          address: true,
          taxRegistrationNumber: true,
          receiptFooter: true,
        },
      });

      if (!before) {
        throw new Error("Business not found.");
      }

      const updated = await tx.business.update({
        where: { id: businessId },
        data,
        select: {
          id: true,
          name: true,
          legalName: true,
          logoUrl: true,
          phone: true,
          email: true,
          address: true,
          taxRegistrationNumber: true,
          receiptFooter: true,
          country: true,
          baseCurrency: true,
        },
      });

      await recordAuditEvent(
        {
          businessId,
          actorId,
          action: AUDIT_ACTIONS.BUSINESS_SETTINGS_CHANGED,
          category: "BUSINESS",
          severity: "INFO",
          outcome: "SUCCESS",
          entityType: "Business",
          entityId: businessId,
          beforeData: before,
          afterData: updated,
          metadata: {
            source: "business_profile_settings",
            updatedFields: Object.keys(data),
          },
        },
        tx,
      );

      return updated;
    });
  },
};
