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

  const [query, setQuery] =
    useState("");

  const [products, setProducts] =
    useState<PosProduct[]>([]);
	
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

  const selectedWarehouse = useMemo(
    () =>
      warehouses.find(
        (warehouse) =>
          warehouse.id === warehouseId,
      ),
    [warehouses, warehouseId],
  );

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
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Point of Sale
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-slate-300">
                Checkout
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              POS
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Sell products, collect payment,
              and keep inventory and accounting
              synchronized.
            </p>
          </div>

          <div className="w-full lg:w-64">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Warehouse
            </label>

            <select
              value={warehouseId}
              onChange={(event) =>
                setWarehouseId(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-cyan-400"
            >
              <option
                value=""
                className="text-slate-900"
              >
                Select warehouse
              </option>

              {warehouses.map(
                (warehouse) => (
                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                    className="text-slate-900"
                  >
                    {warehouse.name}
                  </option>
                ),
              )}
            </select>
          </div>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-violet-700">
                <Search className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Product catalogue
                </p>

                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                  Add products
                </h2>
              </div>
            </div>
			
			<div className="mt-5">
  <PosBarcodeInput
    warehouseId={warehouseId}
    onProductFound={addProduct}
  />
</div>

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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
  <PosProductCard
    key={product.productId}
    product={product}
    onAdd={addProduct}
  />
))}
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                {cart.items.map(
                  (item) => (
                    <div
                      key={item.lineId}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.productName}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {item.sku}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.lineId,
                            )
                          }
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.lineId,
                                item.quantity -
                                  1,
                              )
                            }
                            className="p-2 text-slate-500 transition hover:bg-slate-50"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="min-w-8 text-center text-sm font-semibold text-slate-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.lineId,
                                item.quantity +
                                  1,
                              )
                            }
                            className="p-2 text-slate-500 transition hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {formatAmount(
                            item.totalAmount,
                            currency,
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )}
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

              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  Total
                </span>

                <span className="text-xl font-bold text-slate-950">
                  {formatAmount(
                    cart.totalAmount,
                    currency,
                  )}
                </span>
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
                        className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                          selected
                            ? "border-violet-300 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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

            <button
              type="button"
              disabled={!canCheckout}
              onClick={handleCheckout}
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {checkoutLoading
                ? "Processing sale..."
                : "Complete Sale"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}