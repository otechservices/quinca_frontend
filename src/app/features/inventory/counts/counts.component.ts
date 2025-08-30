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
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';

import { TranslationService } from '../../../core/services/translation.service';
import { StockCount, CountStatus } from '../../../core/models/stock.model';

@Component({
  selector: 'app-counts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    DropdownModule,
    DialogModule,
    ProgressBarModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.counts') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Inventaires physiques et comptages
          </p>
        </div>
        <p-button 
          label="Nouvel inventaire" 
          icon="pi pi-plus"
          (onClick)="showNewCountDialog.set(true)">
        </p-button>
      </div>

      <!-- Filters -->
      <p-card>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchTerm"
              placeholder="N° inventaire..."
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
            [(ngModel)]="selectedWarehouse"
            [options]="warehouseOptions"
            placeholder="Entrepôt"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
        </div>
      </p-card>

      <!-- Stock Counts Table -->
      <p-card>
        <p-table 
          [value]="stockCounts()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Inventaire</th>
              <th>Entrepôt</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Progression</th>
              <th>Écarts</th>
              <th>Statut</th>
              <th>Créé par</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-count>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ count.countNumber }}</span>
              </td>
              <td>{{ count.warehouse }}</td>
              <td>{{ count.startDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ count.endDate | date:'dd/MM/yyyy' || '-' }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <p-progressBar 
                    [value]="count.progress" 
                    [style]="{'width': '80px', 'height': '8px'}">
                  </p-progressBar>
                  <span class="text-sm">{{ count.progress }}%</span>
                </div>
              </td>
              <td>
                <div class="text-right">
                  <span [class]="count.discrepancyValue >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ count.discrepancyValue | currency:'XOF':'symbol':'1.0-0' }}
                  </span>
                </div>
              </td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(count.status)" 
                  [severity]="getStatusSeverity(count.status)">
                </p-tag>
              </td>
              <td>{{ count.createdBy }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button 
                    *ngIf="count.status === 'in_progress'"
                    icon="pi pi-play" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Continuer">
                  </p-button>
                  <p-button 
                    *ngIf="count.status === 'completed'"
                    icon="pi pi-check" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Valider">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- New Count Dialog -->
      <p-dialog 
        header="Nouvel inventaire physique" 
        [(visible)]="showNewCountDialog" 
        [modal]="true" 
        [style]="{width: '600px'}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Entrepôt</label>
            <p-dropdown 
              [(ngModel)]="newCount().warehouseId"
              [options]="warehouseOptions"
              placeholder="Sélectionner un entrepôt"
              optionLabel="label"
              optionValue="value"
              class="w-full">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Date de début</label>
            <input 
              type="date" 
              pInputText 
              [(ngModel)]="newCount.startDate"
              class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              pInputTextarea 
              [(ngModel)]="newCount.notes"
              rows="3"
              placeholder="Notes sur cet inventaire..."
              class="w-full">
            </textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex gap-2">
            <p-button 
              label="Annuler" 
              [text]="true"
              (onClick)="showNewCountDialog.set(false)">
            </p-button>
            <p-button 
              label="Démarrer l'inventaire" 
              (onClick)="createCount()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class CountsComponent implements OnInit {
  stockCounts = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  selectedWarehouse = signal<string>('');
  showNewCountDialog = signal<boolean>(false);
  
  newCount = signal<any>({
    warehouseId: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  statusOptions = [
    { label: 'Planifié', value: 'planned' },
    { label: 'En cours', value: 'in_progress' },
    { label: 'Terminé', value: 'completed' },
    { label: 'Annulé', value: 'cancelled' }
  ];

  warehouseOptions = [
    { label: 'Entrepôt Principal', value: '1' },
    { label: 'Magasin Showroom', value: '2' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadStockCounts();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getStatusLabel(status: CountStatus): string {
    const labels: Record<CountStatus, string> = {
      [CountStatus.PLANNED]: 'Planifié',
      [CountStatus.IN_PROGRESS]: 'En cours',
      [CountStatus.COMPLETED]: 'Terminé',
      [CountStatus.CANCELLED]: 'Annulé'
    };
    return labels[status];
  }

  getStatusSeverity(status: CountStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case CountStatus.COMPLETED:
        return 'success';
      case CountStatus.IN_PROGRESS:
        return 'info';
      case CountStatus.PLANNED:
        return 'warning';
      case CountStatus.CANCELLED:
        return 'danger';
      default:
        return 'info';
    }
  }

  createCount() {
    console.log('Creating stock count:', this.newCount());
    this.showNewCountDialog.set(false);
    this.newCount.set({
      warehouseId: '',
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }

  private loadStockCounts() {
    const mockCounts = [
      {
        id: '1',
        countNumber: 'INV-2024-0001',
        warehouse: 'Entrepôt Principal',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-16'),
        progress: 100,
        discrepancyValue: -25000,
        status: CountStatus.COMPLETED,
        createdBy: 'Jean Dupont'
      },
      {
        id: '2',
        countNumber: 'INV-2024-0002',
        warehouse: 'Magasin Showroom',
        startDate: new Date(),
        endDate: null,
        progress: 65,
        discrepancyValue: 0,
        status: CountStatus.IN_PROGRESS,
        createdBy: 'Marie Kouassi'
      }
    ];

    this.stockCounts.set(mockCounts);
  }
}