export interface Stock {
  id: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reserved: number;
  available: number; // quantity - reserved
  minThreshold: number;
  location?: string; // Rayon/Emplacement
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: Date;
  lastMovementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  managerId?: string;
  manager?: User;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  type: StockMovementType;
  reference: string; // Reference to source document
  referenceType: StockMovementReferenceType;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  sourceWarehouseId?: string;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId?: string;
  destinationWarehouse?: Warehouse;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  notes?: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

export enum StockMovementType {
  IN = 'in',           // Entrée
  OUT = 'out',         // Sortie
  TRANSFER = 'transfer', // Transfert
  ADJUSTMENT = 'adjustment' // Ajustement
}

export enum StockMovementReferenceType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN_PURCHASE = 'return_purchase',
  RETURN_SALE = 'return_sale',
  DAMAGE = 'damage',
  INVENTORY = 'inventory'
}

export interface StockTransfer {
  id: string;
  transferNumber: string; // TR-YYYY-####
  sourceWarehouseId: string;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId: string;
  destinationWarehouse?: Warehouse;
  status: TransferStatus;
  items: StockTransferItem[];
  notes?: string;
  requestedBy: string;
  requestedByUser?: User;
  approvedBy?: string;
  approvedByUser?: User;
  processedBy?: string;
  processedByUser?: User;
  requestedAt: Date;
  approvedAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  requestedQuantity: number;
  transferredQuantity?: number;
  unitCost?: number;
  notes?: string;
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string; // ADJ-YYYY-####
  warehouseId: string;
  warehouse?: Warehouse;
  type: AdjustmentType;
  reason: string;
  items: StockAdjustmentItem[];
  totalValue: number;
  approvedBy?: string;
  approvedByUser?: User;
  createdBy: string;
  createdByUser?: User;
  createdAt: Date;
  approvedAt?: Date;
}

export interface StockAdjustmentItem {
  id: string;
  adjustmentId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  currentQuantity: number;
  adjustedQuantity: number;
  difference: number;
  unitCost: number;
  totalCost: number;
  reason?: string;
}

export enum AdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  RECOUNT = 'recount'
}

export interface StockCount {
  id: string;
  countNumber: string; // INV-YYYY-####
  warehouseId: string;
  warehouse?: Warehouse;
  status: CountStatus;
  startDate: Date;
  endDate?: Date;
  items: StockCountItem[];
  discrepancies: StockCountDiscrepancy[];
  totalItems: number;
  countedItems: number;
  discrepancyValue: number;
  createdBy: string;
  createdByUser?: User;
  completedBy?: string;
  completedByUser?: User;
  createdAt: Date;
  completedAt?: Date;
}

export interface StockCountItem {
  id: string;
  countId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  systemQuantity: number;
  countedQuantity?: number;
  difference?: number;
  unitCost: number;
  discrepancyValue?: number;
  isCounted: boolean;
  countedBy?: string;
  countedByUser?: User;
  countedAt?: Date;
  notes?: string;
}

export interface StockCountDiscrepancy {
  id: string;
  countId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  unitCost: number;
  discrepancyValue: number;
  reason?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedByUser?: User;
  resolvedAt?: Date;
}

export enum CountStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// DTOs
export interface CreateStockTransferRequest {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    notes?: string;
  }[];
  notes?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  warehouseId: string;
  warehouse?: Warehouse;
  type: AlertType;
  currentQuantity: number;
  threshold: number;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: Date;
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRY_SOON = 'expiry_soon',
  EXPIRED = 'expired'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

import { Product, ProductVariant } from './product.model';
import { User } from './user.model';