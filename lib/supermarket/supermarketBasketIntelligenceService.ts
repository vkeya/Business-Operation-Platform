import { prisma } from "@/lib/database/prisma";

const DEFAULT_LOOKBACK_DAYS = 30;
const DEFAULT_MIN_BASKETS = 3;
const MAX_PRODUCTS_PER_BASKET = 50;
const MAX_ASSOCIATIONS = 100;

export interface SupermarketBasketAssociation {
  productA: {
    id: string;
    name: string;
    sku: string;
  };

  productB: {
    id: string;
    name: string;
    sku: string;
  };

  basketsContainingA: number;
  basketsContainingB: number;
  basketsContainingBoth: number;

  supportPercentage: number;
  confidenceAtoBPercentage: number;
  confidenceBtoAPercentage: number;

  lift: number;

  opportunity:
    | "STRONG"
    | "GOOD"
    | "EMERGING"
    | "INSUFFICIENT";
}

export interface SupermarketBasketItem {
  productId: string;
  name: string;
  sku: string;

  basketCount: number;
  basketSharePercentage: number;

  averageUnitsPerBasket: number;

  topAssociations: Array<{
    productId: string;
    name: string;
    sku: string;
    lift: number;
    confidencePercentage: number;
    basketsTogether: number;
  }>;
}

export interface SupermarketBasketSummary {
  businessId: string;
  lookbackDays: number;
  minBaskets: number;

  totalBaskets: number;
  basketsWithProducts: number;

  totalUnits: number;
  averageUnitsPerBasket: number;

  uniqueProducts: number;

  associationCount: number;
  strongAssociationCount: number;
  goodAssociationCount: number;
  emergingAssociationCount: number;

  associations: SupermarketBasketAssociation[];
  products: SupermarketBasketItem[];
}

function round(
  value: number,
  decimals = 2,
) {
  const factor = 10 ** decimals;

  return (
    Math.round(value * factor) / factor
  );
}

function percentage(
  numerator: number,
  denominator: number,
) {
  if (denominator <= 0) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

function getOpportunity(input: {
  lift: number;
  support: number;
  confidenceAtoB: number;
  confidenceBtoA: number;
  basketsTogether: number;
  minBaskets: number;
}): SupermarketBasketAssociation["opportunity"] {
  const {
    lift,
    support,
    confidenceAtoB,
    confidenceBtoA,
    basketsTogether,
    minBaskets,
  } = input;

  if (basketsTogether < minBaskets) {
    return "INSUFFICIENT";
  }

  if (
    lift >= 2 &&
    Math.max(
      confidenceAtoB,
      confidenceBtoA,
    ) >= 40 &&
    support >= 5
  ) {
    return "STRONG";
  }

  if (
    lift >= 1.5 &&
    Math.max(
      confidenceAtoB,
      confidenceBtoA,
    ) >= 25 &&
    support >= 3
  ) {
    return "GOOD";
  }

  if (
    lift > 1 &&
    Math.max(
      confidenceAtoB,
      confidenceBtoA,
    ) >= 15
  ) {
    return "EMERGING";
  }

  return "INSUFFICIENT";
}

export const supermarketBasketIntelligenceService =
  {
    async getBasketIntelligence(
      businessId: string,
      options?: {
        lookbackDays?: number;
        minBaskets?: number;
        warehouseId?: string;
        productId?: string;
      },
    ): Promise<SupermarketBasketSummary> {
      if (!businessId) {
        throw new Error(
          "Business ID is required.",
        );
      }

      const lookbackDays = Math.max(
        1,
        Math.min(
          options?.lookbackDays ??
            DEFAULT_LOOKBACK_DAYS,
          365,
        ),
      );

      const minBaskets = Math.max(
        2,
        Math.min(
          options?.minBaskets ??
            DEFAULT_MIN_BASKETS,
          100,
        ),
      );

      const since = new Date();

      since.setDate(
        since.getDate() - lookbackDays,
      );

      const saleItems =
        await prisma.saleItem.findMany({
          where: {
            sale: {
              businessId,
              status: "COMPLETED",
              createdAt: {
                gte: since,
              },
			},
          },
          select: {
            id: true,
            saleId: true,
            productId: true,
            quantity: true,
            sku: true,
          },
          orderBy: {
            saleId: "asc",
          },
        });



      const productIds = [
        ...new Set(
          saleItems
            .map((item) => item.productId)
            .filter(Boolean),
        ),
      ];

      const productRecords =
        await prisma.product.findMany({
          where: {
            businessId,
            id: {
              in: productIds,
            },
          },
          select: {
            id: true,
            name: true,
            sku: true,
          },
        });

      const productsById = new Map(
        productRecords.map((product) => [
          product.id,
          product,
        ]),
      );

      if (saleItems.length === 0) {
        return {
          businessId,
          lookbackDays,
          minBaskets,

          totalBaskets: 0,
          basketsWithProducts: 0,

          totalUnits: 0,
          averageUnitsPerBasket: 0,

          uniqueProducts: 0,

          associationCount: 0,
          strongAssociationCount: 0,
          goodAssociationCount: 0,
          emergingAssociationCount: 0,

          associations: [],
          products: [],
        };
      }

      /*
       * A basket is represented by one completed sale.
       *
       * We intentionally deduplicate products inside
       * a basket for association analysis. Buying five
       * units of A and one unit of B still represents
       * one A+B basket relationship.
       */
      const baskets =
        new Map<
          string,
          Map<
            string,
            {
              id: string;
              name: string;
              sku: string;
              quantity: number;
            }
          >
        >();

      for (const item of saleItems) {
        let basket =
          baskets.get(item.saleId);

        if (!basket) {
          basket =
            new Map();

          baskets.set(
            item.saleId,
            basket,
          );
        }

        const existing =
          basket.get(item.productId);

        const quantity =
          item.quantity.toNumber();

        if (existing) {
          existing.quantity += quantity;
        } else {
          basket.set(
            item.productId,
            {
              id: item.productId,
              name: productsById.get(item.productId)?.name ?? "Unknown Product",
              sku:
                productsById.get(item.productId)?.sku ??
                item.sku ??
                "",
              quantity,
            },
          );
        }
      }

      const usableBaskets =
        Array.from(
          baskets.values(),
        ).filter(
          (basket) =>
            basket.size > 0 &&
            basket.size <=
              MAX_PRODUCTS_PER_BASKET,
        );

      const productBasketCounts =
        new Map<string, number>();

      const productUnits =
        new Map<string, number>();

      const productInfo =
        new Map<
          string,
          {
            id: string;
            name: string;
            sku: string;
          }
        >();

      let totalUnits = 0;

      for (const basket of usableBaskets) {
        for (const product of basket.values()) {
          productInfo.set(
            product.id,
            {
              id: product.id,
              name: product.name,
              sku: product.sku,
            },
          );

          productBasketCounts.set(
            product.id,
            (productBasketCounts.get(
              product.id,
            ) ?? 0) + 1,
          );

          productUnits.set(
            product.id,
            (productUnits.get(
              product.id,
            ) ?? 0) + product.quantity,
          );

          totalUnits +=
            product.quantity;
        }
      }

      const pairCounts =
        new Map<string, number>();

      for (const basket of usableBaskets) {
        const products =
          Array.from(basket.values())
            .sort((a, b) =>
              a.id.localeCompare(b.id),
            );

        for (
          let i = 0;
          i < products.length;
          i++
        ) {
          for (
            let j = i + 1;
            j < products.length;
            j++
          ) {
            const key =
              `${products[i].id}::${products[j].id}`;

            pairCounts.set(
              key,
              (pairCounts.get(key) ?? 0) +
                1,
            );
          }
        }
      }

      const totalBaskets =
        usableBaskets.length;

      const associations: SupermarketBasketAssociation[] =
        [];

      for (const [
        key,
        basketsTogether,
      ] of pairCounts.entries()) {
        if (
          basketsTogether <
          minBaskets
        ) {
          continue;
        }

        const [
          productAId,
          productBId,
        ] = key.split("::");

        const productA =
          productInfo.get(productAId);

        const productB =
          productInfo.get(productBId);

        if (!productA || !productB) {
          continue;
        }

        const basketsContainingA =
          productBasketCounts.get(
            productAId,
          ) ?? 0;

        const basketsContainingB =
          productBasketCounts.get(
            productBId,
          ) ?? 0;

        const support =
          percentage(
            basketsTogether,
            totalBaskets,
          );

        const confidenceAtoB =
          percentage(
            basketsTogether,
            basketsContainingA,
          );

        const confidenceBtoA =
          percentage(
            basketsTogether,
            basketsContainingB,
          );

        const probabilityA =
          basketsContainingA /
          totalBaskets;

        const probabilityB =
          basketsContainingB /
          totalBaskets;

        const expectedTogether =
          probabilityA *
          probabilityB;

        const actualTogether =
          basketsTogether /
          totalBaskets;

        const lift =
          expectedTogether > 0
            ? actualTogether /
              expectedTogether
            : 0;

        const opportunity =
          getOpportunity({
            lift,
            support,
            confidenceAtoB,
            confidenceBtoA,
            basketsTogether,
            minBaskets,
          });

        associations.push({
          productA: {
            id: productA.id,
            name: productA.name,
            sku: productA.sku,
          },

          productB: {
            id: productB.id,
            name: productB.name,
            sku: productB.sku,
          },

          basketsContainingA,
          basketsContainingB,
          basketsContainingBoth:
            basketsTogether,

          supportPercentage:
            round(support),

          confidenceAtoBPercentage:
            round(confidenceAtoB),

          confidenceBtoAPercentage:
            round(confidenceBtoA),

          lift: round(lift),

          opportunity,
        });
      }

      associations.sort(
        (a, b) => {
          if (
            b.lift !== a.lift
          ) {
            return b.lift - a.lift;
          }

          return (
            b.basketsContainingBoth -
            a.basketsContainingBoth
          );
        },
      );

      const limitedAssociations =
        associations.slice(
          0,
          MAX_ASSOCIATIONS,
        );

      const products: SupermarketBasketItem[] =
        Array.from(
          productInfo.values(),
        )
          .map((product) => {
            const basketCount =
              productBasketCounts.get(
                product.id,
              ) ?? 0;

            const related =
              limitedAssociations
                .flatMap(
                  (association) => {
                    const isA =
                      association.productA.id ===
                      product.id;

                    const isB =
                      association.productB.id ===
                      product.id;

                    if (!isA && !isB) {
                      return [];
                    }

                    const other =
                      isA
                        ? association.productB
                        : association.productA;

                    const confidence =
                      isA
                        ? association
                            .confidenceAtoBPercentage
                        : association
                            .confidenceBtoAPercentage;

                    return [
                      {
                        productId:
                          other.id,
                        name:
                          other.name,
                        sku:
                          other.sku,
                        lift:
                          association.lift,
                        confidencePercentage:
                          round(
                            confidence,
                          ),
                        basketsTogether:
                          association.basketsContainingBoth,
                      },
                    ];
                  },
                )
                .sort(
                  (a, b) => {
                    if (
                      b.lift !== a.lift
                    ) {
                      return (
                        b.lift -
                        a.lift
                      );
                    }

                    return (
                      b.basketsTogether -
                      a.basketsTogether
                    );
                  },
                )
                .slice(0, 5);

            return {
              productId:
                product.id,
              name:
                product.name,
              sku:
                product.sku,

              basketCount,

              basketSharePercentage:
                round(
                  percentage(
                    basketCount,
                    totalBaskets,
                  ),
                ),

              averageUnitsPerBasket:
                round(
                  (productUnits.get(
                    product.id,
                  ) ?? 0) /
                    Math.max(
                      basketCount,
                      1,
                    ),
                ),

              topAssociations:
                related,
            };
          })
          .sort(
            (a, b) =>
              b.basketCount -
              a.basketCount,
          );

      return {
        businessId,
        lookbackDays,
        minBaskets,

        totalBaskets,
        basketsWithProducts:
          totalBaskets,

        totalUnits:
          round(totalUnits),

        averageUnitsPerBasket:
          round(
            totalUnits /
              Math.max(
                totalBaskets,
                1,
              ),
          ),

        uniqueProducts:
          products.length,

        associationCount:
          limitedAssociations.length,

        strongAssociationCount:
          limitedAssociations.filter(
            (item) =>
              item.opportunity ===
              "STRONG",
          ).length,

        goodAssociationCount:
          limitedAssociations.filter(
            (item) =>
              item.opportunity ===
              "GOOD",
          ).length,

        emergingAssociationCount:
          limitedAssociations.filter(
            (item) =>
              item.opportunity ===
              "EMERGING",
          ).length,

        associations:
          limitedAssociations,

        products,
      };
    },
  };