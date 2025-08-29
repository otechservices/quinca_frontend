export interface PurchaseOrder {
  id: string;
  orderNumber: string; // PO-YYYY-####
  supplierId: string;
  supplier?: Supplier;
  warehouseId: string;
  warehouse?: Warehouse;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotalHT: number;
  vatAmount: number;
  totalTTC: number;
  discountPercent?: number;
  discountAmount?: number;
  shippingCost?: number;
  notes?: string;
  internalNotes?: string;
  attachments?: string[];
  createdBy: string;
  createdByUser?: User;
  approvedBy?: string;
  approvedByUser?: User;
  createdAt: Date;
  approvedAt?: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  receivedQuantity: number;
  unitPriceHT: number;
  discountPercent?: number;
  discountAmount?: number;
  vatRate: number;
  vatAmount: number;
  totalHT: number;
  totalTTC: number;
  notes?: string;
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string; // GR-YYYY-####
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  warehouseId: string;
  warehouse?: Warehouse;
  supplierId: string;
  supplier?: Supplier;
  receiptDate: Date;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: Date;
  items: GoodsReceiptItem[];
  subtotalHT: number;
  vatAmount: number;
  totalTTC: number;
  notes?: string;
  attachments?: string[];
  receivedBy: string;
  receivedByUser?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  purchaseOrderItem?: PurchaseOrderItem;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPriceHT: number;
  discountPercent?: number;
  discountAmount?: number;
  vatRate: number;
  vatAmount: number;
  totalHT: number;
  totalTTC: number;
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber: string;
  supplierId: string;
  supplier?: Supplier;
  goodsReceiptId?: string;
  goodsReceipt?: GoodsReceipt;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotalHT: number;
  vatAmount: number;
  totalTTC: number;
  paidAmount: number;
  remainingAmount: number;
  paymentTerms?: PaymentTerms;
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdByUser?: User;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

// DTOs
export interface CreatePurchaseOrderRequest {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: Date;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPriceHT: number;
    discountPercent?: number;
    vatRate: number;
    notes?: string;
  }[];
  discountPercent?: number;
  shippingCost?: number;
  notes?: string;
  internalNotes?: string;
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {
  id: string;
  status?: PurchaseOrderStatus;
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  warehouseId: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: Date;
  items: {
    purchaseOrderItemId: string;
    receivedQuantity: number;
    unitPriceHT?: number;
    batchNumber?: string;
    expiryDate?: Date;
    notes?: string;
  }[];
  notes?: string;
}

export interface PurchaseOrderFilter {
  search?: string;
  supplierId?: string;
  warehouseId?: string;
  status?: PurchaseOrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PurchaseOrderListResponse {
  purchaseOrders: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface GoodsReceiptListResponse {
  goodsReceipts: GoodsReceipt[];
  total: number;
  page: number;
  limit: number;
}

import { Supplier } from './supplier.model';
import { Warehouse } from './stock.model';
import { User } from './user.model';
import { Product, ProductVariant } from './product.model';
import { PaymentTerms } from './supplier.model';