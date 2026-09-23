export type BarcodeLabelSize =
  | "50x25"
  | "38x25";

export interface BarcodeLabelProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  currency: string;
  categoryName: string | null;
  availableQuantity: number;
}

export interface BarcodeLabelSelection {
  productId: string;
  copies: number;
}

export interface BarcodeLabelContent {
  showProductName: boolean;
  showBarcode: boolean;
  showSku: boolean;
  showPrice: boolean;
  showCategory: boolean;
  showBusinessName: boolean;
}

export interface BarcodeLabelSettings {
  size: BarcodeLabelSize;
  content: BarcodeLabelContent;
}

export interface BarcodeLabelPrintJob {
  products: BarcodeLabelSelection[];
  settings: BarcodeLabelSettings;
}