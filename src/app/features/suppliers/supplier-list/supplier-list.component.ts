import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';

import { TranslationService } from '../../../core/services/translation.service';
import { Supplier, PaymentTermType } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    RatingModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.suppliers') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos fournisseurs
          </p>
        </div>
        <p-button 
          label="Nouveau fournisseur" 
          icon="pi pi-plus">
        </p-button>
      </div>

      <!-- Search -->
      <p-card>
        <div class="flex gap-4">
          <span class="p-input-icon-left flex-1">
            <i class="pi pi-search"></i>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchTerm"
              placeholder="Rechercher un fournisseur..."
              class="w-full">
          </span>
          <p-button label="Rechercher" icon="pi pi-search"></p-button>
        </div>
      </p-card>

      <!-- Suppliers Table -->
      <p-card>
        <p-table 
          [value]="suppliers()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Code</th>
              <th>Entreprise</th>
              <th>Contact</th>
              <th>Téléphone</th>
              <th>Conditions</th>
              <th>Évaluation</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-supplier>
            <tr>
              <td>
                <span class="font-mono text-sm">{{ supplier.code }}</span>
              </td>
              <td>
                <div>
                  <div class="font-medium">{{ supplier.companyName }}</div>
                  <div class="text-sm text-gray-500">{{ supplier.contactPerson }}</div>
                </div>
              </td>
              <td>{{ supplier.email || '-' }}</td>
              <td>{{ supplier.phone || '-' }}</td>
              <td>
                <p-tag [value]="getPaymentTermsLabel(supplier.paymentTerms?.type)" severity="info"></p-tag>
              </td>
              <td>
                <p-rating 
                  [ngModel]="supplier.rating || 0" 
                  [readonly]="true" 
                  [cancel]="false"
                  [stars]="5">
                </p-rating>
              </td>
              <td>
                <p-tag 
                  [value]="supplier.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="supplier.isActive ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" size="small" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" pTooltip="Supprimer"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  suppliers = signal<Supplier[]>([]);
  searchTerm = signal<string>('');

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getPaymentTermsLabel(type?: PaymentTermType): string {
    const labels: Record<PaymentTermType, string> = {
      [PaymentTermType.CASH]: 'Comptant',
      [PaymentTermType.NET_15]: 'Net 15j',
      [PaymentTermType.NET_30]: 'Net 30j',
      [PaymentTermType.NET_45]: 'Net 45j',
      [PaymentTermType.NET_60]: 'Net 60j',
      [PaymentTermType.NET_90]: 'Net 90j',
      [PaymentTermType.CUSTOM]: 'Personnalisé'
    };
    return type ? labels[type] : 'Non défini';
  }

  private loadSuppliers() {
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        code: 'SUP-2024-0001',
        companyName: 'Lafarge Holcim Bénin',
        contactPerson: 'Jean Kouassi',
        phone: '+229 21 30 45 67',
        email: 'contact@lafarge.bj',
        paymentTerms: { type: PaymentTermType.NET_30 },
        deliveryDelay: 7,
        isActive: true,
        rating: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'SUP-2024-0002',
        companyName: 'Dangote Cement',
        contactPerson: 'Marie Adjovi',
        phone: '+229 21 45 67 89',
        email: 'orders@dangote.bj',
        paymentTerms: { type: PaymentTermType.NET_45 },
        deliveryDelay: 5,
        isActive: true,
        rating: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.suppliers.set(mockSuppliers);
  }
}