"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

import type {
  BarcodeLabelSize,
} from "@/lib/barcode/labels/barcodeLabelTypes";

interface BarcodeLabelProps {
  productName: string;
  barcode: string;
  sku: string;
  sellingPrice: number;
  currency: string;
  categoryName?: string | null;
  businessName?: string;
  size: BarcodeLabelSize;
  showProductName: boolean;
  showBarcode: boolean;
  showSku: boolean;
  showPrice: boolean;
  showCategory: boolean;
  showBusinessName: boolean;
}

export default function BarcodeLabel({
  productName,
  barcode,
  sku,
  sellingPrice,
  currency,
  categoryName,
  businessName,
  size,
  showProductName,
  showBarcode,
  showSku,
  showPrice,
  showCategory,
  showBusinessName,
}: BarcodeLabelProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  const isSmall = size === "38x25";

  useEffect(() => {
    if (!barcodeRef.current || !barcode.trim()) {
      return;
    }

    try {
      JsBarcode(barcodeRef.current, barcode, {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        width: isSmall ? 1.2 : 1.5,
        height: isSmall ? 32 : 38,
        lineColor: "#000000",
        background: "#ffffff",
      });
    } catch (error) {
      console.error(
        `Unable to render barcode "${barcode}"`,
        error,
      );

      if (barcodeRef.current) {
        barcodeRef.current.innerHTML = "";
      }
    }
  }, [barcode, isSmall]);

  return (
    <div
      className={[
        "barcode-label",
        isSmall
          ? "barcode-label-38x25"
          : "barcode-label-50x25",
      ].join(" ")}
    >
      {showBusinessName && businessName && (
  <div className="barcode-business">
    {businessName}
  </div>
)}

      {showProductName && (
  <div className="barcode-product-name">
    {productName}
  </div>
)}

      {showCategory && categoryName && (
  <div className="barcode-category">
    {categoryName}
  </div>
)}

      {showBarcode && (
  <>
    <div
      className="barcode-bars"
      aria-label={`Barcode ${barcode}`}
    >
      <svg
        ref={barcodeRef}
        role="img"
        aria-label={`Barcode ${barcode}`}
      />
    </div>

    <div className="barcode-number">
      {barcode}
    </div>
  </>
)}

      <div className="barcode-footer">
  {showSku && (
    <span>
      SKU: {sku}
    </span>
  )}

  {showPrice && (
    <span>
      {currency}{" "}
      {sellingPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  )}
</div>
    </div>
  );
}