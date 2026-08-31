import {
  productCategoryRepository,
  type CreateProductCategoryInput,
} from "./productCategoryRepository";
import {
  boutiqueCategoryDefaults,
} from "@/lib/business/boutiqueDefaults";
import {
  winesSpiritsCategoryDefaults,
} from "@/lib/business/winesSpiritsDefaults";


export const productCategoryService = {
  async createCategory(
    input: CreateProductCategoryInput,
  ) {
    const name = input.name.trim();

    if (!input.businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!name) {
      throw new Error(
        "Category name is required.",
      );
    }

    const existingCategory =
      await productCategoryRepository.findByName(
        input.businessId,
        name,
      );

    if (existingCategory) {
      throw new Error(
        `A category named "${name}" already exists.`,
      );
    }

    if (input.parentId) {
      const parent =
        await productCategoryRepository.findById(
          input.businessId,
          input.parentId,
        );

      if (!parent) {
        throw new Error(
          "Parent category not found.",
        );
      }
    }

    return productCategoryRepository.create({
      ...input,
      name,
      description:
        input.description?.trim() || undefined,
    });
  },

  async listCategories(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return productCategoryRepository.list(
      businessId,
    );
  },

    async listAllCategories(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    return productCategoryRepository.listAll(
      businessId,
    );
  },

    async updateCategory(
    businessId: string,
    categoryId: string,
    input: {
      name?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    if (!categoryId) {
      throw new Error(
        "Category ID is required.",
      );
    }

    const existingCategory =
      await productCategoryRepository.findById(
        businessId,
        categoryId,
      );

    if (!existingCategory) {
      throw new Error(
        "Category not found.",
      );
    }

    const name =
      input.name !== undefined
        ? input.name.trim()
        : undefined;

    if (input.name !== undefined && !name) {
      throw new Error(
        "Category name is required.",
      );
    }

    if (
      name &&
      name !== existingCategory.name
    ) {
      const duplicate =
        await productCategoryRepository.findByName(
          businessId,
          name,
        );

      if (
        duplicate &&
        duplicate.id !== categoryId
      ) {
        throw new Error(
          `A category named "${name}" already exists.`,
        );
      }
    }

    return productCategoryRepository.update(
      businessId,
      categoryId,
      {
        ...(name !== undefined
          ? { name }
          : {}),
        ...(input.description !== undefined
          ? {
              description:
                input.description.trim() ||
                undefined,
            }
          : {}),
        ...(input.isActive !== undefined
          ? {
              isActive: input.isActive,
            }
          : {}),
      },
    );
  },

  async ensureBoutiqueCategories(
  businessId: string,
) {
  if (!businessId) {
    throw new Error(
      "Business context is required.",
    );
  }

  const categories = [];
  const categoryByName = new Map<
    string,
    { id: string }
  >();

  // First create or find all parent categories.
  for (const category of boutiqueCategoryDefaults) {
    if (category.parentName) {
      continue;
    }

    const existing =
      await productCategoryRepository.findByName(
        businessId,
        category.name,
      );

    const parent =
      existing ??
      await productCategoryRepository.create({
        businessId,
        name: category.name,
        description: category.description,
      });

    categoryByName.set(
      category.name,
      parent,
    );

    categories.push(parent);
  }

  // Then create or find child categories.
  for (const category of boutiqueCategoryDefaults) {
    if (!category.parentName) {
      continue;
    }

    const parent =
      categoryByName.get(
        category.parentName,
      );

    if (!parent) {
      throw new Error(
        `Parent category "${category.parentName}" was not found.`,
      );
    }

    const existing =
      await productCategoryRepository.findByName(
        businessId,
        category.name,
      );

    const child =
      existing ??
      await productCategoryRepository.create({
        businessId,
        name: category.name,
        description: category.description,
        parentId: parent.id,
      });

    categories.push(child);
  }

  return categories;
},

  async ensureWinesSpiritsCategories(
    businessId: string,
  ) {
    if (!businessId) {
      throw new Error(
        "Business context is required.",
      );
    }

    const categories = [];

    for (
      const category of winesSpiritsCategoryDefaults
    ) {
      const existing =
        await productCategoryRepository.findByName(
          businessId,
          category.name,
        );

      if (existing) {
        categories.push(existing);
        continue;
      }

      const created =
        await productCategoryRepository.create({
          businessId,
          name: category.name,
          description: category.description,
        });

      categories.push(created);
    }

    return categories;
  },
};