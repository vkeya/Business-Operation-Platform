"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PosBarcodeInput from "@/components/pos/PosBarcodeInput";
import PosCustomerSelector from "@/components/pos/PosCustomerSelector";
import PosPaymentDetails from "@/components/pos/PosPaymentDetails";
import PosReceipt from "@/components/pos/PosReceipt";
import type { PosReceipt as PosReceiptData } from "@/lib/pos/posReceiptService";
import {
  Banknote,
  Barcode,
  CreditCard,
  Search,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  WalletCards,
} from "lucide-react";
import { calculateTax } from "@/lib/tax/taxCalculationService";

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


	const [receipt, setReceipt] =
  useState<PosReceiptData | null>(null);

  const [taxConfiguration, setTaxConfiguration] =
  useState<{
    enabled: boolean;
    name: string;
    rate: number;
    pricingMode: "EXCLUSIVE" | "INCLUSIVE";
  }>({
    enabled: false,
    name: "VAT",
    rate: 0,
    pricingMode: "EXCLUSIVE",
  });

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

  const [discountInput, setDiscountInput] =
    useState("");

  const [productQuery, setProductQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<PosProduct[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    const trimmedQuery = productQuery.trim();

    if (!warehouseId || !trimmedQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const params = new URLSearchParams({
          warehouseId,
          q: trimmedQuery,
        });

        const response = await fetch(
          `/api/pos/products?${params.toString()}`,
          { signal: controller.signal, cache: "no-store" },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to search products.",
          );
        }

        setSearchResults(
          Array.isArray(result.products)
            ? result.products
            : [],
        );
      } catch (searchError) {
        if (
          searchError instanceof DOMException &&
          searchError.name === "AbortError"
        ) {
          return;
        }

        setSearchResults([]);
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Unable to search products.",
        );
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [warehouseId, productQuery]);

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
  async function loadTaxConfiguration() {
    try {
      const response = await fetch(
        "/api/pos/tax",
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to load tax configuration.",
        );
      }

      setTaxConfiguration({
        enabled: Boolean(result.taxConfiguration?.enabled),
        name:
          result.taxConfiguration?.name ||
          "VAT",
        rate:
          Number(result.taxConfiguration?.rate) ||
          0,
        pricingMode:
          result.taxConfiguration?.pricingMode ===
          "INCLUSIVE"
            ? "INCLUSIVE"
            : "EXCLUSIVE",
      });
    } catch (taxError) {
      console.error(
        "Unable to load POS tax configuration:",
        taxError,
      );
    }
  }

  void loadTaxConfiguration();
}, []);


  const paymentAmountNumber =
    Number(paymentAmount) || 0;

  const requestedDiscount =
    Number(discountInput) || 0;

  const discountAmount = Math.min(
    Math.max(requestedDiscount, 0),
    Math.max(cart.subtotal, 0),
  );

  const checkoutCart = useMemo(() => {
  const taxCalculation = calculateTax({
    subtotal: cart.subtotal,
    discountAmount,
    taxEnabled: taxConfiguration.enabled,
    taxRate: taxConfiguration.rate,
    pricingMode: taxConfiguration.pricingMode,
  });

  return {
    ...cart,
    discountAmount,
    taxAmount: taxCalculation.taxAmount,
    totalAmount: taxCalculation.totalAmount,
  };
}, [
  cart,
  discountAmount,
  taxConfiguration,
]);

  const change =
    paymentAmountNumber > checkoutCart.totalAmount
      ? paymentAmountNumber -
        cart.totalAmount
      : 0;

  const canCheckout =
    cart.items.length > 0 &&
    checkoutCart.totalAmount > 0 &&
    paymentAmountNumber >=
      checkoutCart.totalAmount &&
    !checkoutLoading;



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
taxAmount: 0,
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
      checkoutCart.totalAmount
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
            cart: checkoutCart,
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
    <div className="min-h-full bg-slate-100 pb-6">
      <section className="border-b border-slate-800 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
              SP
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">SmatPic POS</h1>
                <span className="rounded-full bg-violet-500/20 px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-violet-200">
                  Checkout
                </span>
              </div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Scan • edit • pay
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="sm:w-52">
              <label className="mb-1 block text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                Warehouse
              </label>
              <select
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-violet-400"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-44">
              <label className="mb-1 block text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                Cashier
              </label>
              <div className="flex h-10 items-center rounded-xl border border-slate-700 bg-slate-900 px-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-[9px] font-black text-violet-300">
                  C
                </div>
                <div className="ml-2 min-w-0">
                  <p className="truncate text-[10px] font-bold text-slate-200">Current cashier</p>
                  <p className="truncate text-[8px] text-slate-500">Active session</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-3 py-3 sm:px-5 lg:px-8">
        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-600">Transaction</p>
                  <h2 className="mt-0.5 text-base font-black text-slate-950">Current sale</h2>
                </div>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
                  {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-950 p-3 sm:p-4 space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={productQuery}
                  onChange={(event) => {
                    setProductQuery(event.target.value);
                    setError("");
                  }}
                  placeholder="Search product by name, SKU or barcode..."
                  autoComplete="off"
                  className="h-14 w-full rounded-2xl border border-slate-700 bg-slate-900 pl-12 pr-4 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              {productQuery.trim() && (
                <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                  {searchLoading ? (
                    <div className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Searching products...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                      No matching products
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.productId}
                          type="button"
                          onClick={() => {
                            addProduct(product);
                            setProductQuery("");
                            setSearchResults([]);
                          }}
                          className="flex min-h-16 w-full items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 text-left last:border-b-0 hover:bg-slate-800 active:bg-slate-800"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-white">{product.name}</p>
                            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              {product.sku}
                              {product.barcode ? ` • ${product.barcode}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-black text-violet-300">
                            {formatAmount(product.sellingPrice, currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <PosBarcodeInput
                warehouseId={warehouseId}
                onProductFound={addProduct}
              />
            </div>

            <div className="p-3 sm:p-4">
              {cart.items.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Barcode className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700">Ready to scan</p>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                    Search for a product manually or scan its barcode to add it to the transaction.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div
                      key={item.lineId}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-950">{item.productName}</p>
                          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
                            {item.sku} • {formatAmount(item.unitPrice, currency)} each
                          </p>
                        </div>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-violet-700 active:scale-95"
                            aria-label={`Decrease quantity of ${item.productName}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-black text-slate-950">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-violet-700 active:scale-95"
                            aria-label={`Increase quantity of ${item.productName}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="w-28 text-right sm:w-36">
                          <p className="text-sm font-black text-slate-950">{formatAmount(item.totalAmount, currency)}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.lineId)}
                            className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Subtotal</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{formatAmount(cart.subtotal, currency)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Discount</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-black text-slate-500">−</span>
                    <input
                      type="number"
                      min="0"
                      max={cart.subtotal}
                      step="0.01"
                      value={discountInput}
                      onChange={(event) => setDiscountInput(event.target.value)}
                      placeholder="0.00"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-black text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
                      aria-label="Discount amount"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Tax</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{formatAmount(checkoutCart.taxAmount, currency)}</p>
                </div>
                <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">Total</p>
                  <p className="mt-1 text-lg font-black">{formatAmount(checkoutCart.totalAmount, currency)}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Customer</p>
                <PosCustomerSelector
                  selectedCustomer={selectedCustomer}
                  onSelect={setSelectedCustomer}
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4">
            <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-white sm:px-5">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">Payment</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight">Select payment</h2>
                <span className="text-lg font-black text-violet-300">{formatAmount(checkoutCart.totalAmount, currency)}</span>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const selected = paymentMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black transition active:scale-[0.98] ${
                        selected
                          ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      {method.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <PosPaymentDetails
                  method={paymentMethod}
                  amount={paymentAmount}
                  reference={paymentReference}
                  onAmountChange={setPaymentAmount}
                  onReferenceChange={setPaymentReference}
                />
              </div>

              {change > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="text-xs font-black text-emerald-700">Change</span>
                  <span className="text-base font-black text-emerald-700">{formatAmount(change, currency)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="mt-3 flex min-h-16 w-full items-center justify-between rounded-xl bg-violet-600 px-5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {checkoutLoading ? (
                  <span className="mx-auto">Processing sale...</span>
                ) : (
                  <>
                    <span>Complete Sale</span>
                    <span className="text-violet-200">{formatAmount(checkoutCart.totalAmount, currency)}</span>
                  </>
                )}
              </button>

              {receipt && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Completed transaction</p>
                    <h3 className="mt-1 text-sm font-black text-slate-900">Receipt</h3>
                  </div>
                  <div className="flex justify-center overflow-x-auto">
                    <PosReceipt receipt={receipt} />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

