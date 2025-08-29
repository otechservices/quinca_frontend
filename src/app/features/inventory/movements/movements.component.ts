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
import { StockMovement, StockMovementType } from '../../../core/models/stock.model';

@Component({
  selector: 'app-movements',
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
            Mouvements de Stock
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Historique des mouvements de stock
          </p>
        </div>
        <p-button 
          label="Ajustement manuel" 
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
              placeholder="Produit, référence..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="selectedType"
            [options]="typeOptions"
            placeholder="Type de mouvement"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
          <input 
            type="date" 
            pInputText 
            [(ngModel)]="dateFrom"
            class="w-full">
          <input 
            type="date" 
            pInputText 
            [(ngModel)]="dateTo"
            class="w-full">
        </div>
      </p-card>

      <!-- Movements Table -->
      <p-card>
        <p-table 
          [value]="movements()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Produit</th>
              <th>Entrepôt</th>
              <th>Quantité</th>
              <th>Référence</th>
              <th>Utilisateur</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-movement>
            <tr>
              <td>{{ movement.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <p-tag 
                  [value]="getTypeLabel(movement.type)" 
                  [severity]="getTypeSeverity(movement.type)">
                </p-tag>
              </td>
              <td>
                <div>
                  <div class="font-medium">{{ movement.product }}</div>
                  <div class="text-sm text-surface-500">{{ movement.productCode }}</div>
                </div>
              </td>
              <td>{{ movement.warehouse }}</td>
              <td>
                <span [class]="movement.type === 'out' ? 'text-red-600' : 'text-green-600'">
                  {{ movement.type === 'out' ? '-' : '+' }}{{ movement.quantity }}
                </span>
              </td>
              <td>
                <span class="font-mono text-sm">{{ movement.reference }}</span>
              </td>
              <td>{{ movement.user }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class MovementsComponent implements OnInit {
  movements = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  typeOptions = [
    { label: 'Entrée', value: 'in' },
    { label: 'Sortie', value: 'out' },
    { label: 'Transfert', value: 'transfer' },
    { label: 'Ajustement', value: 'adjustment' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadMovements();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getTypeLabel(type: StockMovementType): string {
    const labels: Record<StockMovementType, string> = {
      [StockMovementType.IN]: 'Entrée',
      [StockMovementType.OUT]: 'Sortie',
      [StockMovementType.TRANSFER]: 'Transfert',
      [StockMovementType.ADJUSTMENT]: 'Ajustement'
    };
    return labels[type];
  }

  getTypeSeverity(type: StockMovementType): 'success' | 'info' | 'warning' | 'danger' {
    switch (type) {
      case StockMovementType.IN:
        return 'success';
      case StockMovementType.OUT:
        return 'danger';
      case StockMovementType.TRANSFER:
        return 'info';
      case StockMovementType.ADJUSTMENT:
        return 'warning';
      default:
        return 'info';
    }
  }

  private loadMovements() {
    const mockMovements = [
      {
        id: '1',
        type: StockMovementType.IN,
        product: 'Ciment Portland 50kg',
        productCode: 'PRD-2024-0001',
        warehouse: 'Entrepôt Principal',
        quantity: 100,
        reference: 'GR-2024-0001',
        user: 'Jean Dupont',
        createdAt: new Date()
      },
      {
        id: '2',
        type: StockMovementType.OUT,
        product: 'Clous 10cm (1kg)',
        productCode: 'PRD-2024-0002',
        warehouse: 'Entrepôt Principal',
        quantity: 5,
        reference: 'SO-2024-0156',
        user: 'Marie Kouassi',
        createdAt: new Date(Date.now() - 3600000)
      }
    ];

    this.movements.set(mockMovements);
  }
}