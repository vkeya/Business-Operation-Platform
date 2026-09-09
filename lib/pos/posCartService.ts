import type {
  PosCart,
  PosCartItem,
  PosProductSelection,
} from "./posTypes";

function calculateLineTotal(
  unitPrice: number,
  quantity: number,
  discountAmount: number,
  taxAmount: number,
): number {
  const grossAmount =
    unitPrice * quantity;

  return (
    grossAmount -
    discountAmount +
    taxAmount
  );
}

export const posCartService = {
  createEmptyCart(): PosCart {
    return {
      items: [],
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    };
  },

  addItem(
    cart: PosCart,
    selection: PosProductSelection,
  ): PosCart {
    const existingIndex =
      cart.items.findIndex(
        (item) =>
          item.productId ===
            selection.productId &&
          item.sellingUnitId ===
            selection.sellingUnitId &&
          item.unitPrice ===
            selection.unitPrice,
      );

    const items = [...cart.items];

    if (existingIndex >= 0) {
      const existing =
        items[existingIndex];

      const quantity =
        existing.quantity +
        selection.quantity;
		
	  const inventoryQuantity =
  existing.inventoryQuantity +
  selection.inventoryQuantity;

      const discountAmount =
        existing.discountAmount +
        selection.discountAmount;

      const taxAmount =
        existing.taxAmount +
        selection.taxAmount;

      items[existingIndex] = {
        ...existing,
        quantity,
		inventoryQuantity,
        discountAmount,
        taxAmount,
        totalAmount:
          calculateLineTotal(
            existing.unitPrice,
            quantity,
            discountAmount,
            taxAmount,
          ),
      };
    } else {
      items.push({
  ...selection,
  lineId: crypto.randomUUID(),
  inventoryQuantity: selection.quantity,
  totalAmount: calculateLineTotal(
    selection.unitPrice,
    selection.quantity,
    selection.discountAmount,
    selection.taxAmount,
  ),
});
    }

    return this.recalculate({
      ...cart,
      items,
    });
  },

  removeItem(
    cart: PosCart,
    lineId: string,
  ): PosCart {
    return this.recalculate({
      ...cart,
      items: cart.items.filter(
        (item) =>
          item.lineId !== lineId,
      ),
    });
  },

  updateQuantity(
  cart: PosCart,
  lineId: string,
  quantity: number,
): PosCart {
  if (quantity <= 0) {
    return this.removeItem(cart, lineId);
  }

  const items = cart.items.map((item) => {
    if (item.lineId !== lineId) {
      return item;
    }

    const inventoryQuantity =
      item.quantity > 0
        ? item.inventoryQuantity * (quantity / item.quantity)
        : quantity;

    return {
      ...item,
      quantity,
      inventoryQuantity,
      totalAmount: calculateLineTotal(
        item.unitPrice,
        quantity,
        item.discountAmount,
        item.taxAmount,
      ),
    };
  });

  return this.recalculate({
    ...cart,
    items,
  });
},

  clear(cart: PosCart): PosCart {
    return {
      ...cart,
      items: [],
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    };
  },

  recalculate(cart: PosCart): PosCart {
    const subtotal =
      cart.items.reduce(
        (total, item) =>
          total +
          item.unitPrice *
            item.quantity,
        0,
      );

    const discountAmount =
      cart.items.reduce(
        (total, item) =>
          total +
          item.discountAmount,
        0,
      );

    const taxAmount =
      cart.items.reduce(
        (total, item) =>
          total + item.taxAmount,
        0,
      );

    const totalAmount =
      cart.items.reduce(
        (total, item) =>
          total + item.totalAmount,
        0,
      );

    return {
      ...cart,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  },
};