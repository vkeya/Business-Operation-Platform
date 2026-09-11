"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PosBarcodeInput from "@/components/pos/PosBarcodeInput";
import PosCustomerSelector from "@/components/pos/PosCustomerSelector";
import PosPaymentDetails from "@/components/pos/PosPaymentDetails";
import PosProductCard from "@/components/pos/PosProductCard";
import PosReceipt from "@/components/pos/PosReceipt";
import type { PosReceipt as PosReceiptData } from "@/lib/pos/posReceiptService";
import {
  productCategoryService,
} from "@/lib/inventory/productCategoryService";

import {
  Banknote,
  Barcode,
  CreditCard,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  posCartService,
} from "@/lib/pos/posCartService";

import type {
  PosCart,
  PosPaymentMethod,
} from "@/lib/pos/posTypes";

import type {
  PosCustomer,
} from "@/lib/pos/posCustomerService";

import type {
  PosProduct,
} from "@/lib/pos/posProductService";

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

const paymentMethods: Array<{
  value: PosPaymentMethod;
  label: string;
  icon: typeof Banknote;
}> = [
  {
    value: "CASH",
    label: "Cash",
    icon: Banknote,
  },
  {
    value: "MPESA",
    label: "M-Pesa",
    icon: WalletCards,
  },
  {
    value: "CARD",
    label: "Card",
    icon: CreditCard,
  },
  {
    value: "BANK",
    label: "Bank",
    icon: WalletCards,
  },
];

function formatAmount(
  amount: number,
  currency: string,
) {
  return `${currency} ${amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

export default function PosPage() {
  const [warehouses, setWarehouses] =
    useState<Warehouse[]>([]);

  const [warehouseId, setWarehouseId] =
    useState("");

	const selectedWarehouse =
  warehouses.find(
    (warehouse) =>
      warehouse.id === warehouseId,
  ) ?? null;

  const [query, setQuery] =
    useState("");

  const [products, setProducts] =
    useState<PosProduct[]>([]);

	const [categories, setCategories] =
  useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

	const [selectedCategoryId, setSelectedCategoryId] =
  useState("ALL");

	const [receipt, setReceipt] =
  useState<PosReceiptData | null>(null);

  const [cart, setCart] =
    useState<PosCart>(() =>
      posCartService.createEmptyCart(),
    );

  const [selectedCustomer, setSelectedCustomer] =
  useState<PosCustomer | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PosPaymentMethod>("CASH");

  const [paymentAmount, setPaymentAmount] =
    useState("");

	const [paymentReference, setPaymentReference] =
  useState("");

  const [currency, setCurrency] =
    useState("KES");

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const response = await fetch(
  "/api/pos/warehouses",
);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load warehouses.",
          );
        }



        const loadedWarehouses =
          Array.isArray(result.warehouses)
            ? result.warehouses
            : [];

        setWarehouses(loadedWarehouses);

        if (loadedWarehouses.length > 0) {
          setWarehouseId(
            loadedWarehouses[0].id,
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load warehouses.",
        );
      }
    }

    loadWarehouses();
  }, []);

   useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          "/api/pos/categories",
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load categories.",
          );
        }

        setCategories(
          Array.isArray(result.categories)
            ? result.categories
            : [],
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load categories.",
        );
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
  setSelectedCategoryId("ALL");

  if (!warehouseId) {
    setProducts([]);
    return;
  }

    const controller =
      new AbortController();

    const timer = window.setTimeout(
      async () => {
        try {
          setLoadingProducts(true);
          setError("");

          const params =
            new URLSearchParams({
              warehouseId,
            });

          if (query.trim()) {
            params.set("q", query.trim());
          }

          const response = await fetch(
            `/api/pos/products?${params.toString()}`,
            {
              signal: controller.signal,
            },
          );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.error ||
                "Unable to load products.",
            );
          }

          setProducts(
            Array.isArray(result.products)
              ? result.products
              : [],
          );
        } catch (loadError) {
          if (
            loadError instanceof DOMException &&
            loadError.name === "AbortError"
          ) {
            return;
          }

          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load products.",
          );
        } finally {
          setLoadingProducts(false);
        }
      },
      250,
    );

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [warehouseId, query]);

  const paymentAmountNumber =
    Number(paymentAmount) || 0;

  const change =
    paymentAmountNumber > cart.totalAmount
      ? paymentAmountNumber -
        cart.totalAmount
      : 0;

  const canCheckout =
    cart.items.length > 0 &&
    cart.totalAmount > 0 &&
    paymentAmountNumber >=
      cart.totalAmount &&
    !checkoutLoading;



const filteredProducts = useMemo(() => {
  if (selectedCategoryId === "ALL") {
    return products;
  }

  return products.filter(
    (product) =>
      product.category?.id ===
      selectedCategoryId,
  );
}, [products, selectedCategoryId]);

  function addProduct(
  product: PosProduct,
  sellingUnitId?: string,
) {
  const sellingUnit = sellingUnitId
    ? product.sellingUnits.find(
        (unit) => unit.id === sellingUnitId,
      )
    : undefined;

  if (sellingUnitId && !sellingUnit) {
    setError(
      `Selling unit not found for ${product.name}.`,
    );
    return;
  }

  const unitPrice =
    sellingUnit?.sellingPrice ??
    product.sellingPrice;

  const inventoryQuantity =
    sellingUnit?.quantity ?? 1;

  if (
    product.trackInventory &&
    product.availableQuantity <= 0
  ) {
    setError(
      `Insufficient stock for ${product.name}.`,
    );
    return;
  }

  const existingInventoryQuantity =
    cart.items
      .filter(
        (item) =>
          item.productId === product.productId,
      )
      .reduce(
        (total, item) =>
          total + item.inventoryQuantity,
        0,
      );

  if (
    product.trackInventory &&
    existingInventoryQuantity +
        inventoryQuantity >
      product.availableQuantity
  ) {
    setError(
      `Not enough stock available for ${product.name}. Available: ${product.availableQuantity}.`,
    );
    return;
  }

  const taxAmount = product.taxRate
    ? unitPrice *
      (product.taxRate / 100)
    : 0;

  setCart(
    posCartService.addItem(cart, {
      productId: product.productId,
      productName: product.name,
      sku: product.sku,
      sellingUnitId,
      quantity: 1,
      inventoryQuantity,
      unitPrice,
      discountAmount: 0,
      taxAmount,
      totalAmount: 0,
    }),
  );
}

  function updateQuantity(
    lineId: string,
    quantity: number,
  ) {
    setCart(
      posCartService.updateQuantity(
        cart,
        lineId,
        quantity,
      ),
    );
  }

  function removeItem(lineId: string) {
    setCart(
      posCartService.removeItem(
        cart,
        lineId,
      ),
    );
  }

  async function handleCheckout() {
    if (!warehouseId) {
      setError(
        "Please select a warehouse.",
      );
      return;
    }

    if (cart.items.length === 0) {
      setError(
        "Add at least one product.",
      );
      return;
    }

    if (
      paymentAmountNumber <
      cart.totalAmount
    ) {
      setError(
        "Payment amount is less than the sale total.",
      );
      return;
    }

	const requiresReference =
  paymentMethod === "MPESA" ||
  paymentMethod === "CARD" ||
  paymentMethod === "BANK";

if (
  requiresReference &&
  !paymentReference.trim()
) {
  setError(
    `Please enter the ${paymentMethod.toLowerCase()} transaction reference.`,
  );
  return;
}

if (
  paymentMethod === "CREDIT" &&
  !selectedCustomer
) {
  setError(
    "A customer is required for credit sales.",
  );
  return;
}

    try {
      setCheckoutLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/pos/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            warehouseId,
            currency,
			customerId:
              selectedCustomer?.customerId,
            cart,
            payment: {
              method: paymentMethod,
              amount:
                paymentAmountNumber,
              currency,
			   reference: paymentReference.trim() || undefined,
            },
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to complete checkout.",
        );
      }

	  const receiptResponse =
  await fetch(
    `/api/pos/receipts/${result.sale.saleId}`,
  );

const receiptResult =
  await receiptResponse.json();

if (!receiptResponse.ok) {
  throw new Error(
    receiptResult.error ||
      "Sale completed, but the receipt could not be loaded.",
  );
}

setReceipt(receiptResult.receipt);

      setSuccessMessage(
        `Sale ${result.sale.referenceNumber} completed successfully.`,
      );

      setCart(
        posCartService.createEmptyCart(),
      );

	  setSelectedCustomer(null);

      setPaymentAmount("");
	  setPaymentReference("");
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to complete checkout.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-extrabold text-white">
        SP
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-950">
            SmatPic POS
          </h1>

          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-700">
            Checkout
          </span>
        </div>

        <p className="mt-0.5 text-[11px] text-slate-400">
          Fast retail checkout
        </p>
      </div>
    </div>

    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
      <div className="min-w-0 flex-1 sm:min-w-56 lg:w-64">
        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Warehouse
        </label>

        <select
          value={warehouseId}
          onChange={(event) =>
            setWarehouseId(
              event.target.value,
            )
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
        >
          <option value="">
            Select warehouse
          </option>

          {warehouses.map(
            (warehouse) => (
              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="flex min-w-0 flex-1 items-end sm:min-w-72 lg:w-80">
        <div className="w-full">
          <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Cashier
          </label>

          <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-extrabold text-violet-700">
              C
            </div>

            <div className="ml-2 min-w-0">
              <p className="truncate text-xs font-bold text-slate-700">
                Current cashier
              </p>

              <p className="truncate text-[9px] text-slate-400">
                Active session
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="p-4">
    <PosBarcodeInput
      warehouseId={warehouseId}
      onProductFound={addProduct}
    />
  </div>
</section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
      <Search className="h-5 w-5" />
    </div>

    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Product catalogue
      </p>

      <h2 className="mt-1 text-base font-extrabold tracking-tight text-slate-950">
        Add products
      </h2>
    </div>
  </div>

  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
    {filteredProducts.length} available
  </span>
</div>

{categories.length > 0 && (
  <div className="mt-4">
    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
      Categories
    </p>

    <div className="-mx-1 overflow-x-auto px-1 pb-1">
    <div className="flex min-w-max gap-2">
      <button
        type="button"
        onClick={() =>
          setSelectedCategoryId("ALL")
        }
        className={`min-h-11 rounded-xl px-4 text-xs font-bold uppercase tracking-wide transition ${
          selectedCategoryId === "ALL"
            ? "bg-violet-600 text-white shadow-sm"
            : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() =>
            setSelectedCategoryId(
              category.id,
            )
          }
          className={`min-h-11 rounded-xl px-4 text-xs font-bold uppercase tracking-wide transition ${
            selectedCategoryId === category.id
              ? "bg-violet-600 text-white shadow-sm"
              : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
   </div>
  </div>
)}



            <div className="mt-5 flex gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value,
                    )
                  }
                  placeholder="Search product, SKU or barcode..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                className="hidden rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:block"
              >
                Clear
              </button>
            </div>

            {selectedWarehouse && (
              <p className="mt-3 text-xs text-slate-400">
                Selling from{" "}
                <span className="font-semibold text-slate-600">
                  {selectedWarehouse.name}
                </span>
              </p>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {loadingProducts ? (
              <div className="flex min-h-48 items-center justify-center">
                <p className="text-sm text-slate-400">
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <Package className="h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No products found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Search by product name,
                  SKU, or barcode.
                </p>
              </div>
            ) : (
              filteredProducts.length === 0 ? (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
    <Package className="h-8 w-8 text-slate-300" />

    <p className="mt-3 text-sm font-semibold text-slate-700">
      No products in this category
    </p>

    <p className="mt-1 max-w-sm text-xs text-slate-400">
      Try another category or select All to
      view the full catalogue.
    </p>

    <button
      type="button"
      onClick={() =>
        setSelectedCategoryId("ALL")
      }
      className="mt-4 min-h-11 rounded-xl bg-violet-600 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-violet-700 active:scale-95"
    >
      View all products
    </button>
  </div>
) : (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    {filteredProducts.map((product) => (
      <PosProductCard
        key={product.productId}
        product={product}
        onAdd={addProduct}
      />
    ))}
  </div>
)
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Current sale
                  </p>

                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                    Cart
                  </h2>
                </div>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {cart.items.length}{" "}
                {cart.items.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {cart.items.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <ShoppingCart className="h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Your cart is empty
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Select a product to begin a
                  sale.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
  <div
    key={item.lineId}
    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {item.productName}
        </p>

        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {item.sku}
        </p>

        {item.sellingUnitId && (
          <p className="mt-1 text-[10px] font-semibold text-violet-600">
            Selling unit
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          removeItem(item.lineId)
        }
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-95"
        aria-label={`Remove ${item.productName}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() =>
            updateQuantity(
              item.lineId,
              item.quantity - 1,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-violet-700 active:scale-95"
          aria-label={`Decrease quantity of ${item.productName}`}
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="flex min-w-12 items-center justify-center px-2 text-base font-extrabold text-slate-900">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() =>
            updateQuantity(
              item.lineId,
              item.quantity + 1,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-violet-700 active:scale-95"
          aria-label={`Increase quantity of ${item.productName}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="text-right">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Line total
        </p>

        <p className="mt-1 text-base font-extrabold tracking-tight text-slate-950">
          {formatAmount(
            item.totalAmount,
            currency,
          )}
        </p>
      </div>
    </div>
  </div>
))}
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>

                <span className="font-semibold text-slate-800">
                  {formatAmount(
                    cart.subtotal,
                    currency,
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm text-slate-500">
                <span>Tax</span>

                <span className="font-semibold text-slate-800">
                  {formatAmount(
                    cart.taxAmount,
                    currency,
                  )}
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-4">
  <div className="flex items-center justify-between gap-4">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
      Total
    </span>

    <span className="text-2xl font-extrabold tracking-tight text-white">
      {formatAmount(
        cart.totalAmount,
        currency,
      )}
    </span>
  </div>
</div>
            </div>

<div className="mt-6">
  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
    Customer
  </p>

  <div className="mt-3">
    <PosCustomerSelector
      selectedCustomer={selectedCustomer}
      onSelect={setSelectedCustomer}
    />
  </div>
</div>

            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Payment method
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {paymentMethods.map(
                  (method) => {
                    const Icon =
                      method.icon;

                    const selected =
                      paymentMethod ===
                      method.value;

                    return (
                      <button
                        key={
                          method.value
                        }
                        type="button"
                        onClick={() =>
                          setPaymentMethod(
                            method.value,
                          )
                        }
                        className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
  selected
    ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/20"
    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
}`}
                      >
                        <Icon className="h-4 w-4" />
                        {method.label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="mt-6">
  <PosPaymentDetails
    method={paymentMethod}
    amount={paymentAmount}
    reference={paymentReference}
    onAmountChange={setPaymentAmount}
    onReferenceChange={setPaymentReference}
  />
</div>

{receipt && (
  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        Completed transaction
      </p>

      <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
        Receipt
      </h2>
    </div>

    <div className="flex justify-center">
      <PosReceipt receipt={receipt} />
    </div>
  </section>
)}


            {change > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                <span className="text-xs font-semibold text-emerald-700">
                  Change
                </span>

                <span className="text-sm font-bold text-emerald-700">
                  {formatAmount(
                    change,
                    currency,
                  )}
                </span>
              </div>
            )}

            {checkoutLoading ? (
  "Processing sale..."
) : (
  <>
    <span>Complete Sale</span>
    <span className="ml-2 text-violet-200">
      {formatAmount(
        cart.totalAmount,
        currency,
      )}
    </span>
  </>
)}
          </div>
        </section>
      </div>
    </div>
  );
}