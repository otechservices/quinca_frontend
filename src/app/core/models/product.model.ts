export interface Product {
  id: string;
  code: string; // PRD-YYYY-####
  name: string;
  slug: string;
  categoryId: string;
  category?: Category | string;
  brand?: string;
  shortDescription?: string;
  longDescription?: string;
  baseUnitId: string;
  baseUnit?: Unit;
  relatedUnits: ProductUnit[];
  variants: ProductVariant[];
  purchasePriceHT: number;
  salePriceHT: number;
  vatRate: number;
  salePriceTTC: number;
  marginPercent: number;
  maxDiscountPercent: number;
  barcodes: string[];
  images: ProductImage[];
  isActive: boolean;
  reorderThreshold: number;
  weight?: number;
  volume?: number;
  stock:number;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  conversionToBase: number; // 1 base unit = X of this unit
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUnit {
  id: string;
  productId: string;
  unitId: string;
  unit?: Unit;
  conversionFactor: number;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>; // {color: 'red', size: 'M'}
  barcode?: string;
  purchasePriceHT?: number;
  salePriceHT?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

// DTOs for API
export interface CreateProductRequest {
  name: string;
  categoryId: string;
  brand?: string;
  shortDescription?: string;
  longDescription?: string;
  baseUnitId: string;
  purchasePriceHT: number;
  salePriceHT: number;
  vatRate: number;
  maxDiscountPercent?: number;
  barcodes?: string[];
  reorderThreshold: number;
  weight?: number;
  volume?: number;
  customFields?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
  isActive?: boolean;
}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  belowThreshold?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// Mock data constants
export const MOCK_CATEGORIES = [
  'Ciment et Béton',
  'Quincaillerie',
  'Plomberie',
  'Électricité',
  'Peinture',
  'Outils',
  'Matériaux de Construction',
  'Sécurité'
];

export const MOCK_BRANDS = [
  'Lafarge',
  'Dangote',
  'Stanley',
  'Bosch',
  'Makita',
  'DeWalt',
  'Schneider',
  'Legrand'
];

export const MOCK_UNITS = [
  { name: 'Pièce', symbol: 'pcs', conversionToBase: 1 },
  { name: 'Boîte', symbol: 'box', conversionToBase: 20 },
  { name: 'Paquet', symbol: 'pkg', conversionToBase: 10 },
  { name: 'Sac', symbol: 'sac', conversionToBase: 50 },
  { name: 'Mètre', symbol: 'm', conversionToBase: 1 },
  { name: 'Litre', symbol: 'L', conversionToBase: 1 },
  { name: 'Kilogramme', symbol: 'kg', conversionToBase: 1 }
];