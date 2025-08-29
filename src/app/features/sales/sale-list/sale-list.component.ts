import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';

import { TranslationService } from '../../../core/services/translation.service';
import { Sale, SaleStatus, SaleChannel } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
            {{ t('navigation.sales') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Historique des ventes
          </p>
        </div>
        <div class="flex gap-2">
          <p-button 
            label="Point de vente" 
            icon="pi pi-calculator"
            routerLink="/sales/pos">
          </p-button>
          <p-button 
            label="Nouvelle vente" 
            icon="pi pi-plus">
          </p-button>
        </div>
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
              placeholder="N° vente, client..."
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
          <p-dropdown 
            [(ngModel)]="selectedChannel"
            [options]="channelOptions"
            placeholder="Canal"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
          <input 
            type="date" 
            pInputText 
            [(ngModel)]="selectedDate"
            class="w-full">
        </div>
      </p-card>

      <!-- Sales Table -->
      <p-card>
        <p-table 
          [value]="sales()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Vente</th>
              <th>Client</th>
              <th>Date</th>
              <th>Canal</th>
              <th>Articles</th>
              <th>Montant TTC</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-sale>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ sale.saleNumber }}</span>
              </td>
              <td>{{ sale.customer || 'Client anonyme' }}</td>
              <td>{{ sale.saleDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <p-tag 
                  [value]="getChannelLabel(sale.channel)" 
                  severity="info">
                </p-tag>
              </td>
              <td>{{ sale.itemCount }} article(s)</td>
              <td class="text-right">
                <span class="font-medium">{{ sale.totalTTC | currency:'XOF':'symbol':'1.0-0' }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(sale.status)" 
                  [severity]="getStatusSeverity(sale.status)">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button icon="pi pi-print" [text]="true" size="small" pTooltip="Imprimer"></p-button>
                  <p-button icon="pi pi-replay" [text]="true" size="small" pTooltip="Retour"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class SaleListComponent implements OnInit {
  sales = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  selectedChannel = signal<string>('');
  selectedDate = signal<string>('');

  statusOptions = [
    { label: 'Complétée', value: 'completed' },
    { label: 'Payée', value: 'paid' },
    { label: 'Partiellement payée', value: 'partially_paid' },
    { label: 'Annulée', value: 'cancelled' }
  ];

  channelOptions = [
    { label: 'Point de vente', value: 'pos' },
    { label: 'En ligne', value: 'online' },
    { label: 'Téléphone', value: 'phone' },
    { label: 'Comptoir', value: 'counter' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadSales();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getStatusLabel(status: SaleStatus): string {
    const labels: Record<SaleStatus, string> = {
      [SaleStatus.DRAFT]: 'Brouillon',
      [SaleStatus.COMPLETED]: 'Complétée',
      [SaleStatus.PARTIALLY_PAID]: 'Partiellement payée',
      [SaleStatus.PAID]: 'Payée',
      [SaleStatus.CANCELLED]: 'Annulée',
      [SaleStatus.REFUNDED]: 'Remboursée'
    };
    return labels[status];
  }

  getStatusSeverity(status: SaleStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case SaleStatus.PAID:
      case SaleStatus.COMPLETED:
        return 'success';
      case SaleStatus.PARTIALLY_PAID:
        return 'warning';
      case SaleStatus.CANCELLED:
      case SaleStatus.REFUNDED:
        return 'danger';
      default:
        return 'info';
    }
  }

  getChannelLabel(channel: SaleChannel): string {
    const labels: Record<SaleChannel, string> = {
      [SaleChannel.POS]: 'POS',
      [SaleChannel.ONLINE]: 'En ligne',
      [SaleChannel.PHONE]: 'Téléphone',
      [SaleChannel.COUNTER]: 'Comptoir'
    };
    return labels[channel];
  }

  private loadSales() {
    const mockSales = [
      {
        id: '1',
        saleNumber: 'SO-2024-0156',
        customer: 'Marie Adjovi',
        saleDate: new Date(),
        channel: SaleChannel.POS,
        itemCount: 3,
        totalTTC: 125000,
        status: SaleStatus.PAID
      },
      {
        id: '2',
        saleNumber: 'SO-2024-0155',
        customer: 'BTP Construction SARL',
        saleDate: new Date(Date.now() - 3600000),
        channel: SaleChannel.COUNTER,
        itemCount: 8,
        totalTTC: 450000,
        status: SaleStatus.COMPLETED
      }
    ];

    this.sales.set(mockSales);
  }
}