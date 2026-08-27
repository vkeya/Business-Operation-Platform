export type BusinessType =
  | "restaurant"
  | "bar"
  | "hotel"
  | "hospital"
  | "supermarket"
  | "shop"
  | "boutique"
  | "other";

export type BusinessStatus = "active" | "suspended" | "inactive";

export interface Business {
  id: string;
  name: string;
  legalName?: string;
  type: BusinessType;
  country: string;
  baseCurrency: string;
  language: string;
  timezone: string;
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country: string;
  currency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  businessId: string;
  branchId?: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  businessId: string;
  name: string;
  email: string;
  roleIds: string[];
  branchIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}