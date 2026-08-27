import { prisma } from "@/lib/database/prisma";

export interface CreateProductCategoryInput {
  businessId: string;
  name: string;
  description?: string;
  parentId?: string;
}

export const productCategoryRepository = {
  async create(
    input: CreateProductCategoryInput,
  ) {
    return prisma.productCategory.create({
      data: {
        businessId: input.businessId,
        name: input.name,
        description: input.description,
        parentId: input.parentId,
      },
    });
  },

  async list(businessId: string) {
    return prisma.productCategory.findMany({
      where: {
        businessId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
  
    async listAll(businessId: string) {
    return prisma.productCategory.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async findById(
    businessId: string,
    categoryId: string,
  ) {
    return prisma.productCategory.findFirst({
      where: {
        id: categoryId,
        businessId,
      },
    });
  },

  async findByName(
    businessId: string,
    name: string,
  ) {
    return prisma.productCategory.findFirst({
      where: {
        businessId,
        name,
      },
    });
  },
  
    async update(
    businessId: string,
    categoryId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.productCategory.updateMany({
      where: {
        id: categoryId,
        businessId,
      },
      data,
    });
  },
};