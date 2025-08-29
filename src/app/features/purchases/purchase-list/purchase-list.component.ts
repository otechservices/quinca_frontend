import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';

import { TranslationService } from '../../../core/services/translation.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../core/models/purchase.model';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    DropdownModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.purchases') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos commandes d'achat
          </p>
        </div>
        <p-button 
          label="Nouvelle commande" 
          icon="pi pi-plus">
        </p-button>
      </div>

      <!-- Filters -->
      <p-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchTerm"
              placeholder="N° commande, fournisseur..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="selectedStatus"
            [options]="statusOptions"
            placeholder="Statut"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
          <input 
            type="date" 
            pInputText 
            [(ngModel)]="dateFrom"
            placeholder="Date début"
            class="w-full">
          <input 
            type="date" 
            pInputText 
            [(ngModel)]="dateTo"
            placeholder="Date fin"
            class="w-full">
        </div>
      </p-card>

      <!-- Purchase Orders Table -->
      <p-card>
        <p-table 
          [value]="purchaseOrders()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Commande</th>
              <th>Fournisseur</th>
              <th>Date</th>
              <th>Livraison prévue</th>
              <th>Montant TTC</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-order>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ order.orderNumber }}</span>
              </td>
              <td>{{ order.supplier }}</td>
              <td>{{ order.orderDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ order.expectedDeliveryDate | date:'dd/MM/yyyy' }}</td>
              <td class="text-right">
                <span class="font-medium">{{ order.totalTTC | currency:'XOF':'symbol':'1.0-0' }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(order.status)" 
                  [severity]="getStatusSeverity(order.status)">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" size="small" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-truck" [text]="true" size="small" pTooltip="Réceptionner"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class PurchaseListComponent implements OnInit {
  purchaseOrders = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  statusOptions = [
    { label: 'Brouillon', value: 'draft' },
    { label: 'Envoyée', value: 'sent' },
    { label: 'Confirmée', value: 'confirmed' },
    { label: 'Partiellement reçue', value: 'partially_received' },
    { label: 'Reçue', value: 'received' },
    { label: 'Annulée', value: 'cancelled' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadPurchaseOrders();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getStatusLabel(status: PurchaseOrderStatus): string {
    const labels: Record<PurchaseOrderStatus, string> = {
      [PurchaseOrderStatus.DRAFT]: 'Brouillon',
      [PurchaseOrderStatus.SENT]: 'Envoyée',
      [PurchaseOrderStatus.CONFIRMED]: 'Confirmée',
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'Partiellement reçue',
      [PurchaseOrderStatus.RECEIVED]: 'Reçue',
      [PurchaseOrderStatus.CANCELLED]: 'Annulée'
    };
    return labels[status];
  }

  getStatusSeverity(status: PurchaseOrderStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case PurchaseOrderStatus.RECEIVED:
        return 'success';
      case PurchaseOrderStatus.CONFIRMED:
      case PurchaseOrderStatus.SENT:
        return 'info';
      case PurchaseOrderStatus.PARTIALLY_RECEIVED:
      case PurchaseOrderStatus.DRAFT:
        return 'warning';
      case PurchaseOrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'info';
    }
  }

  private loadPurchaseOrders() {
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'PO-2024-0001',
        supplier: 'Lafarge Holcim',
        orderDate: new Date('2024-01-15'),
        expectedDeliveryDate: new Date('2024-01-22'),
        totalTTC: 1250000,
        status: PurchaseOrderStatus.CONFIRMED
      },
      {
        id: '2',
        orderNumber: 'PO-2024-0002',
        supplier: 'Dangote Cement',
        orderDate: new Date('2024-01-16'),
        expectedDeliveryDate: new Date('2024-01-21'),
        totalTTC: 890000,
        status: PurchaseOrderStatus.PARTIALLY_RECEIVED
      }
    ];

    this.purchaseOrders.set(mockOrders);
  }
}