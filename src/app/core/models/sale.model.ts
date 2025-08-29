export interface Sale {
  id: string;
  saleNumber: string; // SO-YYYY-####
  customerId?: string;
  customer?: Customer;
  warehouseId: string;
  warehouse?: Warehouse;
  channel: SaleChannel;
  status: SaleStatus;
  saleDate: Date;
  items: SaleItem[];
  subtotalHT: number;
  discountPercent?: number;
  discountAmount?: number;
  vatAmount: number;
  totalTTC: number;
  payments: SalePayment[];
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  cashierId: string;
  cashier?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPriceHT: number;
  discountPercent?: number;
  discountAmount?: number;
  vatRate: number;
  vatAmount: number;
  totalHT: number;
  totalTTC: number;
  notes?: string;
}

export enum SaleChannel {
  POS = 'pos',
  ONLINE = 'online',
  PHONE = 'phone',
  COUNTER = 'counter'
}

export enum SaleStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface SalePayment {
  id: string;
  saleId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  transactionId?: string;
  changeAmount?: number;
  status: PaymentStatus;
  processedAt: Date;
  notes?: string;
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CREDIT = 'credit'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface POSCart {
  items: POSCartItem[];
  subtotalHT: number;
  discountPercent: number;
  discountAmount: number;
  vatAmount: number;
  totalTTC: number;
  customerId?: string;
  customer?: Customer;
  notes?: string;
}

export interface POSCartItem {
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPriceHT: number;
  discountPercent: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  totalHT: number;
  totalTTC: number;
  availableStock: number;
}

export interface POSPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  changeAmount?: number;
}

// Receipt/Invoice models
export interface Receipt {
  id: string;
  saleId: string;
  sale?: Sale;
  receiptNumber: string;
  type: ReceiptType;
  format: ReceiptFormat;
  template: string;
  data: any;
  generatedAt: Date;
  printedAt?: Date;
  emailedAt?: Date;
}

export enum ReceiptType {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  QUOTE = 'quote',
  DELIVERY_NOTE = 'delivery_note'
}

export enum ReceiptFormat {
  THERMAL_80MM = 'thermal_80mm',
  A4_PDF = 'a4_pdf',
  EMAIL = 'email'
}

// DTOs
export interface CreateSaleRequest {
  customerId?: string;
  warehouseId: string;
  channel: SaleChannel;
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
  payments: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
    changeAmount?: number;
  }[];
  notes?: string;
}

export interface UpdateSaleRequest extends Partial<CreateSaleRequest> {
  id: string;
  status?: SaleStatus;
}

export interface ProcessPOSSaleRequest {
  customerId?: string;
  warehouseId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPriceHT: number;
    discountPercent?: number;
  }[];
  discountPercent?: number;
  payments: POSPayment[];
  notes?: string;
  printReceipt?: boolean;
  receiptFormat?: ReceiptFormat;
}

export interface SaleFilter {
  search?: string;
  customerId?: string;
  warehouseId?: string;
  cashierId?: string;
  channel?: SaleChannel;
  status?: SaleStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
}

export interface SaleListResponse {
  sales: Sale[];
  total: number;
  page: number;
  limit: number;
}

export interface SalesReport {
  period: {
    from: Date;
    to: Date;
  };
  totalSales: number;
  totalAmount: number;
  totalTransactions: number;
  averageTicket: number;
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    amount: number;
  }[];
  salesByDay: {
    date: Date;
    sales: number;
    amount: number;
    transactions: number;
  }[];
  salesByPaymentMethod: {
    method: PaymentMethod;
    amount: number;
    percentage: number;
  }[];
  salesByCashier: {
    cashierId: string;
    cashierName: string;
    sales: number;
    amount: number;
    transactions: number;
  }[];
}

// POS specific interfaces
export interface POSSession {
  id: string;
  cashierId: string;
  cashier?: User;
  warehouseId: string;
  warehouse?: Warehouse;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalMobileMoney: number;
  totalTransactions: number;
  status: POSSessionStatus;
  notes?: string;
}

export enum POSSessionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  SUSPENDED = 'suspended'
}

export interface CashDrawer {
  isOpen: boolean;
  currentAmount: number;
  lastOpenedAt?: Date;
  lastClosedAt?: Date;
}

import { Customer } from './supplier.model';
import { Warehouse } from './stock.model';
import { User } from './user.model';
import { Product, ProductVariant } from './product.model';