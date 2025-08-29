export interface Supplier {
  id: string;
  code: string; // SUP-YYYY-####
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: Address;
  taxNumber?: string; // NIF
  paymentTerms?: PaymentTerms;
  deliveryDelay?: number; // in days
  isActive: boolean;
  rating?: number; // 1-5 stars
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface PaymentTerms {
  type: PaymentTermType;
  days?: number; // for NET_X terms
  discountPercent?: number;
  discountDays?: number;
}

export enum PaymentTermType {
  CASH = 'cash',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  CUSTOM = 'custom'
}

export interface Customer {
  id: string;
  code: string; // CUS-YYYY-####
  type: CustomerType;
  // For individuals
  firstName?: string;
  lastName?: string;
  // For companies
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: Address;
  taxNumber?: string; // NIF
  creditLimit?: number;
  currentBalance: number;
  paymentTerms?: PaymentTerms;
  isActive: boolean;
  loyaltyPoints?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CustomerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}

// DTOs
export interface CreateSupplierRequest {
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: Address;
  taxNumber?: string;
  paymentTerms?: PaymentTerms;
  deliveryDelay?: number;
  notes?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: string;
  isActive?: boolean;
  rating?: number;
}

export interface CreateCustomerRequest {
  type: CustomerType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: Address;
  taxNumber?: string;
  creditLimit?: number;
  paymentTerms?: PaymentTerms;
  notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: string;
  isActive?: boolean;
  loyaltyPoints?: number;
  currentBalance?: number;
}

export interface SupplierFilter {
  search?: string;
  isActive?: boolean;
  paymentTermType?: PaymentTermType;
  minRating?: number;
}

export interface CustomerFilter {
  search?: string;
  type?: CustomerType;
  isActive?: boolean;
  hasCredit?: boolean;
  minBalance?: number;
  maxBalance?: number;
}

export interface SupplierListResponse {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

// Mock data
export const MOCK_SUPPLIERS = [
  'CFAO Motors',
  'Dangote Cement',
  'Lafarge Holcim',
  'Total Energies',
  'Bolloré Logistics',
  'SOBEBRA',
  'Bénin Control',
  'SONACOM',
  'Tractafric Motors',
  'SOBEMAP'
];

export const MOCK_CUSTOMERS = [
  'Entreprise BTP Bénin',
  'Construction Moderne SARL',
  'Atelier Mécanique Central',
  'Société de Plomberie',
  'Électricité Générale',
  'Menuiserie Artisanale',
  'Peinture Décoration',
  'Sécurité Industrielle'
];