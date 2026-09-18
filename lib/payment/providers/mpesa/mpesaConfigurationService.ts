import "server-only";

import { prisma } from "@/lib/database/prisma";
import {
  decryptSecret,
  encryptSecret,
} from "@/lib/security/encryption";
import { getMpesaAccessToken } from "./mpesaAuth";


export type MpesaMerchantType = "TILL" | "PAYBILL";
export type MpesaEnvironment = "SANDBOX" | "PRODUCTION";

export interface SaveMpesaConfigurationInput {
  businessId: string;
  merchantType: MpesaMerchantType;
  shortcode: string;
  consumerKey: string;
  consumerSecret?: string;
  passkey?: string;
  environment?: MpesaEnvironment;
}

export const mpesaConfigurationService = {
  async save(input: SaveMpesaConfigurationInput) {
    if (!input.businessId) {
      throw new Error("Business context is required.");
    }

    if (!input.merchantType) {
      throw new Error("M-Pesa merchant type is required.");
    }

    if (!input.shortcode?.trim()) {
      throw new Error("M-Pesa shortcode is required.");
    }

    if (!input.consumerKey?.trim()) {
      throw new Error("M-Pesa consumer key is required.");
    }


    const business = await prisma.business.findUnique({
      where: {
        id: input.businessId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!business) {
      throw new Error("Business not found.");
    }

    if (business.status !== "ACTIVE") {
      throw new Error("Business is not active.");
    }

    const existingConfiguration =
  await prisma.mpesaConfiguration.findUnique({
    where: {
      businessId: input.businessId,
    },
    select: {
      encryptedConsumerSecret: true,
      encryptedPasskey: true,
    },
  });

const consumerSecret = input.consumerSecret?.trim();
const passkey = input.passkey?.trim();

if (!existingConfiguration && !consumerSecret) {
  throw new Error("M-Pesa consumer secret is required.");
}

if (!existingConfiguration && !passkey) {
  throw new Error("M-Pesa passkey is required.");
}

const encryptedConsumerSecret = consumerSecret
  ? encryptSecret(consumerSecret)
  : existingConfiguration?.encryptedConsumerSecret;

const encryptedPasskey = passkey
  ? encryptSecret(passkey)
  : existingConfiguration?.encryptedPasskey;

if (!encryptedConsumerSecret) {
  throw new Error("M-Pesa consumer secret is required.");
}

if (!encryptedPasskey) {
  throw new Error("M-Pesa passkey is required.");
}

    const configuration = await prisma.mpesaConfiguration.upsert({
      where: {
        businessId: input.businessId,
      },

      create: {
        businessId: input.businessId,
        merchantType: input.merchantType,
        shortcode: input.shortcode.trim(),
        consumerKey: input.consumerKey.trim(),
        encryptedConsumerSecret,
        encryptedPasskey,
        environment: input.environment ?? "SANDBOX",
        isActive: true,
      },

      update: {
        merchantType: input.merchantType,
        shortcode: input.shortcode.trim(),
        consumerKey: input.consumerKey.trim(),
        encryptedConsumerSecret,
        encryptedPasskey,
        environment: input.environment ?? "SANDBOX",
        isActive: true,
        verifiedAt: null,
      },

      select: {
        id: true,
        businessId: true,
        merchantType: true,
        shortcode: true,
        environment: true,
        isActive: true,

        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return configuration;
  },

  async getByBusinessId(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.mpesaConfiguration.findUnique({
      where: {
        businessId,
      },

      select: {
        id: true,
        businessId: true,
        merchantType: true,
        shortcode: true,
        consumerKey: true,
        environment: true,
        isActive: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getCredentialsForServerUse(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.mpesaConfiguration.findUnique({
      where: {
        businessId,
      },

      select: {
        id: true,
        businessId: true,
        merchantType: true,
        shortcode: true,
        consumerKey: true,
        encryptedConsumerSecret: true,
        encryptedPasskey: true,
        environment: true,
        isActive: true,
		verifiedAt: true,
      },
    });
  },
  
  async verify(businessId: string) {
  if (!businessId) {
    throw new Error("Business context is required.");
  }

  const configuration =
    await prisma.mpesaConfiguration.findUnique({
      where: {
        businessId,
      },
      select: {
        id: true,
        businessId: true,
        consumerKey: true,
        encryptedConsumerSecret: true,
        environment: true,
        isActive: true,
      },
    });

  if (!configuration) {
    throw new Error(
      "M-Pesa is not configured for this business."
    );
  }

  if (!configuration.isActive) {
    throw new Error(
      "M-Pesa configuration is inactive."
    );
  }

  const consumerSecret = decryptSecret(
    configuration.encryptedConsumerSecret
  );

  try {
    await getMpesaAccessToken({
      environment: configuration.environment,
      consumerKey: configuration.consumerKey,
      consumerSecret,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to verify M-Pesa credentials."
    );
  }

  const verifiedAt = new Date();

  await prisma.mpesaConfiguration.update({
    where: {
      id: configuration.id,
    },
    data: {
      verifiedAt,
    },
  });

  return {
    success: true,
    verifiedAt,
  };
},

  async deactivate(businessId: string) {
    if (!businessId) {
      throw new Error("Business context is required.");
    }

    return prisma.mpesaConfiguration.update({
      where: {
        businessId,
      },

      data: {
        isActive: false,
      },

      select: {
        id: true,
        businessId: true,
        isActive: true,
      },
    });
  },
};