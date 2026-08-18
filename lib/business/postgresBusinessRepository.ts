import { prisma } from "@/lib/database/prisma";
import type {
  Branch,
  Business,
  BusinessStatus,
  BusinessType,
  Warehouse,
} from "@/types";
import type { BusinessRepository } from "./businessRepository";
import type { BusinessSetup } from "@/types/setup";

function mapBusiness(record: {
  id: string;
  name: string;
  legalName: string | null;
  type: string;
  country: string;
  baseCurrency: string;
  language: string;
  timezone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Business {
  return {
    id: record.id,
    name: record.name,
    legalName: record.legalName ?? undefined,
    type: record.type as BusinessType,
    country: record.country,
    baseCurrency: record.baseCurrency,
    language: record.language,
    timezone: record.timezone,
    status: record.status as BusinessStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapBranch(record: {
  id: string;
  businessId: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  country: string;
  currency: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Branch {
  return {
    id: record.id,
    businessId: record.businessId,
    name: record.name,
    code: record.code,
    address: record.address ?? undefined,
    city: record.city ?? undefined,
    country: record.country,
    currency: record.currency ?? undefined,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapWarehouse(record: {
  id: string;
  businessId: string;
  branchId: string | null;
  name: string;
  code: string;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Warehouse {
  return {
    id: record.id,
    businessId: record.businessId,
    branchId: record.branchId ?? undefined,
    name: record.name,
    code: record.code,
    address: record.address ?? undefined,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const postgresBusinessRepository: BusinessRepository = {
  async createBusiness(setup: BusinessSetup) {
    const business = await prisma.business.create({
      data: {
        name: setup.business.name,
        type: setup.business.type,
        country: setup.business.country,
        baseCurrency: setup.business.baseCurrency,
        language: setup.business.language,
        timezone: setup.business.timezone,

        branches: {
          create: {
            name: setup.branch.name,
            code: setup.branch.code,
            country: setup.business.country,
            currency: setup.business.baseCurrency,
          },
        },

        warehouses: {
          create: {
            name: setup.warehouse.name,
            code: setup.warehouse.code,
          },
        },
      },
      include: {
        branches: true,
        warehouses: true,
      },
    });

    const branchRecord = business.branches[0];
    const warehouseRecord = business.warehouses[0];

    if (!branchRecord || !warehouseRecord) {
      throw new Error(
        "Business setup did not create the initial branch and warehouse.",
      );
    }

    return {
      business: mapBusiness(business),
      branch: mapBranch(branchRecord),
      warehouse: mapWarehouse(warehouseRecord),
    };
  },

  async getBusiness(businessId: string) {
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });

    return business ? mapBusiness(business) : null;
  },

  async getBranches(businessId: string) {
    const branches = await prisma.branch.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return branches.map(mapBranch);
  },

  async getWarehouses(businessId: string) {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return warehouses.map(mapWarehouse);
  },
};