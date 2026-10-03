"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

import { posCartService } from "@/lib/pos/posCartService";

import type { PosCart, PosPaymentMethod } from "@/lib/pos/posTypes";

import type { PosCustomer } from "@/lib/pos/posCustomerService";

import type { PosProduct } from "@/lib/pos/posProductService";

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface PosPrescriptionItem {
  id: string;
  productId: string;
  productName?: string;
  quantityPrescribed: number;
  quantityDispensed: number;
  quantityRemaining: number;
  dosageInstructions?: string | null;
  duration?: string | null;
  notes?: string | null;
}

interface PosPrescription {
  id: string;
  prescriptionNumber: string;
  prescriptionDate: string;
  expiryDate?: string | null;
  prescriberName: string;
  status: string;
  customerId?: string | null;
  items: PosPrescriptionItem[];
}

interface PharmacyBatchPreview {
  batchNumber: string;
  expiryDate: string;
  quantityRemaining: number;
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

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PosPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [warehouseId, setWarehouseId] = useState("");

  const [receipt, setReceipt] = useState<PosReceiptData | null>(null);

  const [taxConfiguration, setTaxConfiguration] = useState<{
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

  const [cart, setCart] = useState<PosCart>(() =>
    posCartService.createEmptyCart(),
  );

  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(
    null,
  );

  const [prescriptionQuery, setPrescriptionQuery] = useState("");

  const [prescriptionResults, setPrescriptionResults] = useState<
    PosPrescription[]
  >([]);

  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const [selectedPrescriptionItem, setSelectedPrescriptionItem] = useState<{
    prescriptionId: string;
    prescriptionItemId: string;
  } | null>(null);

  const [pendingPrescriptionProduct, setPendingPrescriptionProduct] =
    useState<PosProduct | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("CASH");

  const [paymentAmount, setPaymentAmount] = useState("");

  const [paymentReference, setPaymentReference] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [currency, setCurrency] = useState("KES");

  const [discountInput, setDiscountInput] = useState("");

  const [productQuery, setProductQuery] = useState("");

  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const [pharmacyBatchPreviews, setPharmacyBatchPreviews] = useState<
    Record<string, PharmacyBatchPreview[]>
  >({});

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [pendingPaymentAttemptId, setPendingPaymentAttemptId] = useState<
    string | null
  >(null);

  const [pendingPaymentSaleId, setPendingPaymentSaleId] = useState<
    string | null
  >(null);

  const [paymentPolling, setPaymentPolling] = useState(false);

  const [paymentTimedOut, setPaymentTimedOut] = useState(false);

  const paymentPendingSinceRef = useRef<number | null>(null);
  const PAYMENT_PENDING_TIMEOUT_MS = 2 * 60 * 1000;

  const resetPaymentSession = useCallback(() => {
    paymentPendingSinceRef.current = null;

    setPendingPaymentAttemptId(null);
    setPendingPaymentSaleId(null);
    setPaymentPolling(false);
    setPaymentTimedOut(false);

    setPaymentAmount("");
    setPaymentReference("");
    setCustomerPhone("");
  }, []);

  const resetCompletedTransaction = useCallback(() => {
    setCart(posCartService.createEmptyCart());
    setSelectedCustomer(null);
    resetPaymentSession();
  }, [resetPaymentSession]);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const trimmedQuery = productQuery.trim();

    if (!warehouseId || !trimmedQuery) {
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

        const response = await fetch(`/api/pos/products?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to search products.");
        }

        setSearchResults(Array.isArray(result.products) ? result.products : []);
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
    const trimmedQuery = prescriptionQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    const timer = window.setTimeout(() => {
      void searchPrescriptions(trimmedQuery);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [prescriptionQuery]);

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const response = await fetch("/api/pos/warehouses");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load warehouses.");
        }

        const loadedWarehouses = Array.isArray(result.warehouses)
          ? result.warehouses
          : [];

        setWarehouses(loadedWarehouses);

        if (loadedWarehouses.length > 0) {
          setWarehouseId(loadedWarehouses[0].id);
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
        const response = await fetch("/api/pos/tax", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load tax configuration.");
        }

        setTaxConfiguration({
          enabled: Boolean(result.taxConfiguration?.enabled),
          name: result.taxConfiguration?.name || "VAT",
          rate: Number(result.taxConfiguration?.rate) || 0,
          pricingMode:
            result.taxConfiguration?.pricingMode === "INCLUSIVE"
              ? "INCLUSIVE"
              : "EXCLUSIVE",
        });
      } catch (taxError) {
        console.error("Unable to load POS tax configuration:", taxError);
      }
    }

    void loadTaxConfiguration();
  }, []);

  useEffect(() => {
    if (!pendingPaymentAttemptId) {
      return;
    }

    let cancelled = false;
    let pollingTimer: number | null = null;

    async function checkPaymentStatus() {
      try {
        setPaymentPolling(true);

        const response = await fetch(
          `/api/pos/payment-attempt/${pendingPaymentAttemptId}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to check M-Pesa payment status.",
          );
        }

        const status = result.attempt?.status;

        if (cancelled) {
          return;
        }

        /*
         * Reconcile a payment that remains pending after
         * the initial waiting period. This allows the POS
         * to recover from delayed provider callbacks without
         * creating a second payment attempt.
         */
        if (
          status === "PENDING" &&
          paymentPendingSinceRef.current !== null &&
          Date.now() - paymentPendingSinceRef.current >= 10000
        ) {
          paymentPendingSinceRef.current = Date.now();

          const reconcileResponse = await fetch(
            `/api/pos/payment-attempt/${pendingPaymentAttemptId}`,
            {
              method: "POST",
              cache: "no-store",
            },
          );

          const reconcileResult = await reconcileResponse.json();

          if (!reconcileResponse.ok) {
            throw new Error(
              reconcileResult.error || "Unable to reconcile M-Pesa payment.",
            );
          }

          const reconciledStatus = reconcileResult.result?.status;

          if (reconciledStatus === "FAILED") {
            setPaymentPolling(false);
            setError(
              reconcileResult.result?.message ||
                "The M-Pesa payment was not completed.",
            );
            resetPaymentSession();
            return;
          }

          if (reconciledStatus === "PAID") {
            /*
             * The reconciliation endpoint has confirmed
             * payment. Treat it exactly like a normal PAID
             * polling response.
             */
            setPaymentPolling(false);
            setPaymentTimedOut(false);
            setSuccessMessage("M-Pesa payment received successfully.");

            if (pendingPaymentSaleId) {
              const receiptResponse = await fetch(
                `/api/pos/receipts/${pendingPaymentSaleId}`,
              );

              const receiptResult = await receiptResponse.json();

              if (!receiptResponse.ok) {
                throw new Error(
                  receiptResult.error ||
                    "Payment received, but the receipt could not be loaded.",
                );
              }

              if (!cancelled) {
                setReceipt(receiptResult.receipt);
                resetCompletedTransaction();
              }
            } else {
              resetPaymentSession();
            }

            return;
          }
        }

        if (cancelled) {
          return;
        }

        /*
         * Do not automatically create another payment attempt
         * when the provider is still processing the current one.
         */
        if (
          paymentPendingSinceRef.current !== null &&
          Date.now() - paymentPendingSinceRef.current >=
            PAYMENT_PENDING_TIMEOUT_MS
        ) {
          setPaymentPolling(false);
          setSuccessMessage("");
          setPaymentTimedOut(true);
          setError(
            "M-Pesa payment is still processing. Please check the payment status before retrying.",
          );
          return;
        }

        if (status === "PAID") {
          setPaymentPolling(false);
          setPaymentTimedOut(false);
          setSuccessMessage("M-Pesa payment received successfully.");

          if (pendingPaymentSaleId) {
            const receiptResponse = await fetch(
              `/api/pos/receipts/${pendingPaymentSaleId}`,
            );

            const receiptResult = await receiptResponse.json();

            if (!receiptResponse.ok) {
              throw new Error(
                receiptResult.error ||
                  "Payment received, but the receipt could not be loaded.",
              );
            }

            if (!cancelled) {
              setReceipt(receiptResult.receipt);
              resetCompletedTransaction();
            }

            return;
          }

          resetPaymentSession();
          return;
        }

        if (status === "FAILED") {
          setPaymentPolling(false);
          setPaymentTimedOut(false);
          setSuccessMessage("");
          setError("The M-Pesa payment was not completed.");
          resetPaymentSession();
          return;
        }

        pollingTimer = window.setTimeout(checkPaymentStatus, 2000);
      } catch (pollingError) {
        if (cancelled) {
          return;
        }

        setPaymentPolling(false);
        setError(
          pollingError instanceof Error
            ? pollingError.message
            : "Unable to check M-Pesa payment status.",
        );
      }
    }

    void checkPaymentStatus();

    return () => {
      cancelled = true;

      if (pollingTimer !== null) {
        window.clearTimeout(pollingTimer);
      }

      setPaymentPolling(false);
    };
  }, [
    pendingPaymentAttemptId,
    pendingPaymentSaleId,
    resetCompletedTransaction,
    resetPaymentSession,
    PAYMENT_PENDING_TIMEOUT_MS,
  ]);

  const paymentAmountNumber = Number(paymentAmount) || 0;

  const requestedDiscount = Number(discountInput) || 0;

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
  }, [cart, discountAmount, taxConfiguration]);

  const change =
    paymentAmountNumber > checkoutCart.totalAmount
      ? paymentAmountNumber - checkoutCart.totalAmount
      : 0;

  const canCheckout =
    cart.items.length > 0 &&
    checkoutCart.totalAmount > 0 &&
    paymentAmountNumber >= checkoutCart.totalAmount &&
    !checkoutLoading &&
    !paymentPolling &&
    !pendingPaymentAttemptId;

  async function searchPrescriptions(query: string) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setPrescriptionResults([]);
      return;
    }

    try {
      setPrescriptionLoading(true);
      setError("");

      const params = new URLSearchParams({
        prescriptionNumber: trimmedQuery,
      });

      const response = await fetch(
        `/api/pharmacy/prescriptions?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to search prescriptions.");
      }

      setPrescriptionResults(
        Array.isArray(result.prescriptions) ? result.prescriptions : [],
      );
    } catch (prescriptionError) {
      setPrescriptionResults([]);
      setError(
        prescriptionError instanceof Error
          ? prescriptionError.message
          : "Unable to search prescriptions.",
      );
    } finally {
      setPrescriptionLoading(false);
    }
  }

  async function loadPharmacyBatchPreview(product: PosProduct) {
    if (!product.pharmacyProduct || !warehouseId) {
      return;
    }

    try {
      const params = new URLSearchParams({
        productId: product.productId,
        warehouseId,
      });

      const response = await fetch(
        `/api/pos/pharmacy-batches?${params.toString()}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load pharmacy batch information.",
        );
      }

      setPharmacyBatchPreviews((current) => ({
        ...current,
        [product.productId]: Array.isArray(result.batches)
          ? result.batches
          : [],
      }));
    } catch (batchError) {
      console.error("Unable to load pharmacy batch preview:", batchError);
    }
  }

  function handleProductSelection(product: PosProduct) {
    if (product.pharmacyProduct) {
      void loadPharmacyBatchPreview(product);
    }

    const prescriptionType = product.pharmacyProduct?.prescriptionType;

    if (
      prescriptionType === "PRESCRIPTION" ||
      prescriptionType === "CONTROLLED"
    ) {
      setPendingPrescriptionProduct(product);
      setPrescriptionQuery("");
      setPrescriptionResults([]);
      setSelectedPrescriptionItem(null);
      setError("");
      return;
    }

    addProduct(product);
  }

  function addProduct(
    product: PosProduct,
    sellingUnitId?: string,
    prescriptionSelection?: {
      prescriptionId: string;
      prescriptionItemId: string;
    },
  ) {
    if (prescriptionSelection) {
      const prescription = prescriptionResults.find(
        (item) => item.id === prescriptionSelection.prescriptionId,
      );

      const prescriptionItem = prescription?.items.find(
        (item) => item.id === prescriptionSelection.prescriptionItemId,
      );

      if (!prescriptionItem) {
        setError("The selected prescription item could not be found.");
        return;
      }

      const existingPrescriptionQuantity = cart.items
        .filter(
          (item) =>
            item.prescriptionItemId ===
            prescriptionSelection.prescriptionItemId,
        )
        .reduce((total, item) => total + item.quantity, 0);

      if (
        existingPrescriptionQuantity + 1 >
        prescriptionItem.quantityRemaining
      ) {
        setError(
          `Only ${prescriptionItem.quantityRemaining} unit(s) remain on this prescription.`,
        );
        return;
      }
    }

    const sellingUnit = sellingUnitId
      ? product.sellingUnits.find((unit) => unit.id === sellingUnitId)
      : undefined;

    if (sellingUnitId && !sellingUnit) {
      setError(`Selling unit not found for ${product.name}.`);
      return;
    }

    const unitPrice = sellingUnit?.sellingPrice ?? product.sellingPrice;

    const inventoryQuantity = sellingUnit?.quantity ?? 1;

    if (product.trackInventory && product.availableQuantity <= 0) {
      setError(`Insufficient stock for ${product.name}.`);
      return;
    }

    const existingInventoryQuantity = cart.items
      .filter((item) => item.productId === product.productId)
      .reduce((total, item) => total + item.inventoryQuantity, 0);

    if (
      product.trackInventory &&
      existingInventoryQuantity + inventoryQuantity > product.availableQuantity
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

        prescriptionId: prescriptionSelection?.prescriptionId,

        prescriptionItemId: prescriptionSelection?.prescriptionItemId,

        quantity: 1,
        inventoryQuantity,
        unitPrice,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
      }),
    );
  }

  function updateQuantity(lineId: string, quantity: number) {
    const item = cart.items.find((cartItem) => cartItem.lineId === lineId);

    if (!item) {
      return;
    }

    if (item.prescriptionItemId && quantity > item.quantity) {
      const prescription = prescriptionResults.find(
        (result) => result.id === item.prescriptionId,
      );

      const prescriptionItem = prescription?.items.find(
        (prescriptionItem) => prescriptionItem.id === item.prescriptionItemId,
      );

      if (!prescriptionItem) {
        setError("Prescription details could not be found for this cart item.");
        return;
      }

      if (quantity > prescriptionItem.quantityRemaining) {
        setError(
          `Only ${prescriptionItem.quantityRemaining} unit(s) remain on this prescription.`,
        );
        return;
      }
    }

    setCart(posCartService.updateQuantity(cart, lineId, quantity));
  }

  function removeItem(lineId: string) {
    setCart(posCartService.removeItem(cart, lineId));
  }

  async function handleCheckout() {
    if (!warehouseId) {
      setError("Please select a warehouse.");
      return;
    }

    if (cart.items.length === 0) {
      setError("Add at least one product.");
      return;
    }

    if (paymentAmountNumber < checkoutCart.totalAmount) {
      setError("Payment amount is less than the sale total.");
      return;
    }

    const requiresReference =
      paymentMethod === "CARD" || paymentMethod === "BANK";

    if (requiresReference && !paymentReference.trim()) {
      setError(
        `Please enter the ${paymentMethod.toLowerCase()} transaction reference.`,
      );
      return;
    }

    if (paymentMethod === "MPESA" && !customerPhone.trim()) {
      setError("Please enter the customer's M-Pesa phone number.");
      return;
    }

    if (
      paymentMethod === "MPESA" &&
      !Number.isInteger(checkoutCart.totalAmount)
    ) {
      setError("M-Pesa payments require a whole-number KES sale total.");
      return;
    }

    if (paymentMethod === "CREDIT" && !selectedCustomer) {
      setError("A customer is required for credit sales.");
      return;
    }

    try {
      setCheckoutLoading(true);
      setError("");
      setSuccessMessage("");

      const operationId = crypto.randomUUID();

      const response = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationId,
          warehouseId,
          currency,
          customerId: selectedCustomer?.customerId,
          cart: checkoutCart,
          payment: {
            method: paymentMethod,
            amount: paymentAmountNumber,
            currency,
            reference: paymentReference.trim() || undefined,
            customerPhone:
              paymentMethod === "MPESA" ? customerPhone.trim() : undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to complete checkout.");
      }

      if (result.status === "PENDING") {
        const attemptId = result.paymentAttempt?.attemptId;

        const saleId = result.sale?.saleId;

        if (!attemptId || !saleId) {
          throw new Error(
            "M-Pesa payment was initiated, but the payment tracking details are missing.",
          );
        }

        paymentPendingSinceRef.current = Date.now();
        setPaymentTimedOut(false);
        setPendingPaymentAttemptId(attemptId);
        setPendingPaymentSaleId(saleId);

        setSuccessMessage(
          result.paymentAttempt?.message ||
            "M-Pesa payment request sent. Waiting for customer confirmation.",
        );

        return;
      }

      if (result.status !== "COMPLETED") {
        throw new Error("Unexpected checkout status received.");
      }

      const receiptResponse = await fetch(
        `/api/pos/receipts/${result.sale.saleId}`,
      );

      const receiptResult = await receiptResponse.json();

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

      resetCompletedTransaction();
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
                <h1 className="text-lg font-black tracking-tight">
                  SmatPic POS
                </h1>
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
                onChange={(event) => {
                  setWarehouseId(event.target.value);
                  setPharmacyBatchPreviews({});
                }}
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
                  <p className="truncate text-[10px] font-bold text-slate-200">
                    Current cashier
                  </p>
                  <p className="truncate text-[8px] text-slate-500">
                    Active session
                  </p>
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
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-600">
                    Transaction
                  </p>
                  <h2 className="mt-0.5 text-base font-black text-slate-950">
                    Current sale
                  </h2>
                </div>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
                  {cart.items.length}{" "}
                  {cart.items.length === 1 ? "item" : "items"}
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
                            handleProductSelection(product);
                            setProductQuery("");
                            setSearchResults([]);
                          }}
                          className="flex min-h-16 w-full items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 text-left last:border-b-0 hover:bg-slate-800 active:bg-slate-800"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-white">
                              {product.name}
                            </p>
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
                onProductFound={handleProductSelection}
              />
              {pendingPrescriptionProduct && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-700">
                        Prescription required
                      </p>

                      <h3 className="mt-1 text-sm font-black text-slate-950">
                        {pendingPrescriptionProduct.name}
                      </h3>

                      <p className="mt-1 text-[10px] font-bold text-slate-500">
                        {pendingPrescriptionProduct.pharmacyProduct
                          ?.prescriptionType === "CONTROLLED"
                          ? "Controlled medicine"
                          : "Prescription medicine"}
                      </p>

                      {pendingPrescriptionProduct.pharmacyProduct
                        ?.prescriptionType === "CONTROLLED" && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-red-700">
                            Controlled dispensing
                          </p>
                          <p className="mt-1 text-[10px] font-bold leading-4 text-red-700">
                            A valid prescription and authorized
                            controlled-medicine dispensing are required. SmatPic
                            will record the dispensing against the selected
                            prescription and FEFO batch.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPendingPrescriptionProduct(null);
                        setPrescriptionQuery("");
                        setPrescriptionResults([]);
                        setSelectedPrescriptionItem(null);
                      }}
                      className="rounded-lg px-2 py-1 text-[9px] font-black uppercase text-slate-500 hover:bg-amber-100"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-[8px] font-black uppercase tracking-[0.16em] text-amber-700">
                      Prescription number
                    </label>

                    <input
                      value={prescriptionQuery}
                      onChange={(event) =>
                        setPrescriptionQuery(event.target.value)
                      }
                      placeholder="Enter prescription number..."
                      autoComplete="off"
                      className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>

                  {prescriptionQuery.trim() && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-amber-200 bg-white">
                      {prescriptionLoading ? (
                        <div className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Searching prescription...
                        </div>
                      ) : prescriptionResults.length === 0 ? (
                        <div className="px-4 py-4 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                          No active prescription found
                        </div>
                      ) : (
                        <div className="max-h-72 overflow-y-auto">
                          {prescriptionResults.map((prescription) => {
                            const matchingItems = prescription.items.filter(
                              (item) =>
                                item.productId ===
                                pendingPrescriptionProduct.productId,
                            );

                            if (matchingItems.length === 0) {
                              return null;
                            }

                            return (
                              <div
                                key={prescription.id}
                                className="border-b border-slate-100 p-3 last:border-b-0"
                              >
                                <div>
                                  <p className="text-xs font-black text-slate-900">
                                    {prescription.prescriptionNumber}
                                  </p>

                                  <p className="mt-0.5 text-[9px] font-bold text-slate-500">
                                    Prescriber: {prescription.prescriberName}
                                  </p>
                                </div>

                                <div className="mt-2 space-y-2">
                                  {matchingItems.map((item) => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedPrescriptionItem({
                                          prescriptionId: prescription.id,
                                          prescriptionItemId: item.id,
                                        });
                                      }}
                                      className={`w-full rounded-xl border px-3 py-3 text-left ${
                                        selectedPrescriptionItem?.prescriptionItemId ===
                                        item.id
                                          ? "border-violet-500 bg-violet-50"
                                          : "border-slate-200 bg-slate-50 hover:border-violet-300"
                                      }`}
                                    >
                                      <p className="text-xs font-black text-slate-900">
                                        {pendingPrescriptionProduct.name}
                                      </p>

                                      <p className="mt-1 text-[9px] font-bold text-slate-500">
                                        Prescribed: {item.quantityPrescribed} •
                                        Remaining: {item.quantityRemaining}
                                      </p>

                                      {item.dosageInstructions && (
                                        <p className="mt-1 text-[9px] text-slate-500">
                                          {item.dosageInstructions}
                                        </p>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPrescriptionItem && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!pendingPrescriptionProduct) {
                          return;
                        }

                        const prescription = prescriptionResults.find((item) =>
                          item.items.some(
                            (prescriptionItem) =>
                              prescriptionItem.id ===
                              selectedPrescriptionItem?.prescriptionItemId,
                          ),
                        );

                        const prescriptionItem = prescription?.items.find(
                          (item) =>
                            item.id ===
                            selectedPrescriptionItem?.prescriptionItemId,
                        );

                        if (!prescriptionItem) {
                          setError(
                            "The selected prescription item could not be found.",
                          );
                          return;
                        }

                        if (prescriptionItem.quantityRemaining < 1) {
                          setError(
                            "This prescription item has no remaining quantity.",
                          );
                          return;
                        }

                        addProduct(
                          pendingPrescriptionProduct,
                          undefined,
                          selectedPrescriptionItem,
                        );

                        setPendingPrescriptionProduct(null);
                        setPrescriptionQuery("");
                        setPrescriptionResults([]);
                        setSelectedPrescriptionItem(null);
                      }}
                      className="mt-3 h-11 w-full rounded-xl bg-violet-600 text-xs font-black uppercase tracking-wider text-white hover:bg-violet-700"
                    >
                      Add Prescribed Medicine
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4">
              {cart.items.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Barcode className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700">
                    Ready to scan
                  </p>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                    Search for a product manually or scan its barcode to add it
                    to the transaction.
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
                          <p className="truncate text-sm font-black text-slate-950">
                            {item.productName}
                          </p>
                          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
                            {item.sku} •{" "}
                            {formatAmount(item.unitPrice, currency)} each
                          </p>

                          {item.prescriptionId && (
                            <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-700">
                              Prescription attached
                            </span>
                          )}

                          {item.prescriptionId &&
                            pharmacyBatchPreviews[item.productId] &&
                            pharmacyBatchPreviews[item.productId].length > 0 &&
                            pharmacyBatchPreviews[item.productId] && (
                              <span className="ml-1 mt-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-violet-700">
                                FEFO
                              </span>
                            )}
                          {pharmacyBatchPreviews[item.productId]?.length ? (
                            <div className="mt-2 rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[8px] font-black uppercase tracking-[0.14em] text-violet-700">
                                  FEFO batch
                                </span>
                                <span className="text-[8px] font-bold text-violet-500">
                                  Auto-selected at checkout
                                </span>
                              </div>
                              {pharmacyBatchPreviews[item.productId]
                                .slice(0, 2)
                                .map((batch) => (
                                  <div
                                    key={batch.batchNumber}
                                    className="mt-1 flex items-center justify-between gap-3 text-[9px] font-bold text-slate-600"
                                  >
                                    <span>Batch {batch.batchNumber}</span>
                                    <span>
                                      {batch.quantityRemaining} available · exp{" "}
                                      {new Date(
                                        batch.expiryDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.lineId, item.quantity - 1)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-violet-700 active:scale-95"
                            aria-label={`Decrease quantity of ${item.productName}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-black text-slate-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.lineId, item.quantity + 1)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-violet-700 active:scale-95"
                            aria-label={`Increase quantity of ${item.productName}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="w-28 text-right sm:w-36">
                          <p className="text-sm font-black text-slate-950">
                            {formatAmount(item.totalAmount, currency)}
                          </p>
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
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Subtotal
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {formatAmount(cart.subtotal, currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Discount
                  </p>
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
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Tax
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {formatAmount(checkoutCart.taxAmount, currency)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-black">
                    {formatAmount(checkoutCart.totalAmount, currency)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Customer
                </p>
                <PosCustomerSelector
                  selectedCustomer={selectedCustomer}
                  onSelect={setSelectedCustomer}
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4">
            <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-white sm:px-5">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                Payment
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight">
                  Select payment
                </h2>
                <span className="text-lg font-black text-violet-300">
                  {formatAmount(checkoutCart.totalAmount, currency)}
                </span>
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
                      onClick={() => {
                        setPaymentMethod(method.value);

                        if (method.value === "MPESA") {
                          setPaymentAmount(checkoutCart.totalAmount.toString());
                        }
                      }}
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
                  customerPhone={customerPhone}
                  onAmountChange={setPaymentAmount}
                  onReferenceChange={setPaymentReference}
                  onCustomerPhoneChange={setCustomerPhone}
                />
              </div>

              {change > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="text-xs font-black text-emerald-700">
                    Change
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {formatAmount(change, currency)}
                  </span>
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
                ) : paymentPolling ? (
                  <span className="mx-auto">Waiting for M-Pesa payment...</span>
                ) : (
                  <>
                    <span>Complete Sale</span>
                    <span className="text-violet-200">
                      {formatAmount(checkoutCart.totalAmount, currency)}
                    </span>
                  </>
                )}
              </button>

              {paymentTimedOut && pendingPaymentAttemptId && (
                <button
                  type="button"
                  disabled={paymentPolling}
                  onClick={async () => {
                    try {
                      setPaymentPolling(true);
                      setError("");

                      const response = await fetch(
                        `/api/pos/payment-attempt/${pendingPaymentAttemptId}`,
                        {
                          method: "POST",
                          cache: "no-store",
                        },
                      );

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          result.error ||
                            "Unable to check M-Pesa payment status.",
                        );
                      }

                      const status = result.result?.status;

                      if (status === "PAID") {
                        setPaymentTimedOut(false);
                        setPaymentPolling(false);
                        setSuccessMessage(
                          "M-Pesa payment received successfully.",
                        );

                        if (pendingPaymentSaleId) {
                          const receiptResponse = await fetch(
                            `/api/pos/receipts/${pendingPaymentSaleId}`,
                          );

                          const receiptResult = await receiptResponse.json();

                          if (!receiptResponse.ok) {
                            throw new Error(
                              receiptResult.error ||
                                "Payment received, but the receipt could not be loaded.",
                            );
                          }

                          setReceipt(receiptResult.receipt);
                          resetCompletedTransaction();
                        }

                        return;
                      }

                      if (status === "FAILED") {
                        setPaymentTimedOut(false);
                        setPaymentPolling(false);
                        setError(
                          result.result?.message ||
                            "The M-Pesa payment was not completed.",
                        );
                        setPendingPaymentAttemptId(null);
                        setPendingPaymentSaleId(null);
                        paymentPendingSinceRef.current = null;
                        return;
                      }

                      paymentPendingSinceRef.current = Date.now();

                      setPaymentTimedOut(false);
                      setSuccessMessage(
                        result.result?.message ||
                          "M-Pesa payment is still being processed.",
                      );
                    } catch (statusError) {
                      setError(
                        statusError instanceof Error
                          ? statusError.message
                          : "Unable to check M-Pesa payment status.",
                      );
                    } finally {
                      setPaymentPolling(false);
                    }
                  }}
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-xs font-black uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {paymentPolling
                    ? "Checking M-Pesa..."
                    : "Check M-Pesa Status"}
                </button>
              )}

              {receipt && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Completed transaction
                    </p>
                    <h3 className="mt-1 text-sm font-black text-slate-900">
                      Receipt
                    </h3>

                    <button
                      type="button"
                      onClick={() => {
                        setReceipt(null);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="mt-3 min-h-11 w-full rounded-xl bg-violet-600 px-4 text-xs font-black uppercase tracking-wide text-white transition hover:bg-violet-700"
                    >
                      New Sale
                    </button>
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
