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

import { TranslationService } from '../../../core/services/translation.service';
import { StockTransfer, TransferStatus } from '../../../core/models/stock.model';

@Component({
  selector: 'app-transfers',
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
    DialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.transfers') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les transferts entre entrepôts
          </p>
        </div>
        <p-button 
          label="Nouveau transfert" 
          icon="pi pi-plus"
          (onClick)="showNewTransferDialog.set(true)">
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
              placeholder="N° transfert..."
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
            [(ngModel)]="selectedSourceWarehouse"
            [options]="warehouseOptions"
            placeholder="Entrepôt source"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
          <p-dropdown 
            [(ngModel)]="selectedDestWarehouse"
            [options]="warehouseOptions"
            placeholder="Entrepôt destination"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
        </div>
      </p-card>

      <!-- Transfers Table -->
      <p-card>
        <p-table 
          [value]="transfers()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Transfert</th>
              <th>Entrepôt source</th>
              <th>Entrepôt destination</th>
              <th>Articles</th>
              <th>Date demande</th>
              <th>Statut</th>
              <th>Demandé par</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-transfer>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ transfer.transferNumber }}</span>
              </td>
              <td>{{ transfer.sourceWarehouse }}</td>
              <td>{{ transfer.destinationWarehouse }}</td>
              <td>{{ transfer.itemCount }} article(s)</td>
              <td>{{ transfer.requestedAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(transfer.status)" 
                  [severity]="getStatusSeverity(transfer.status)">
                </p-tag>
              </td>
              <td>{{ transfer.requestedBy }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button 
                    *ngIf="transfer.status === 'pending'"
                    icon="pi pi-check" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Approuver">
                  </p-button>
                  <p-button 
                    *ngIf="transfer.status === 'approved'"
                    icon="pi pi-send" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Traiter">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- New Transfer Dialog -->
      <p-dialog 
        header="Nouveau transfert" 
        [(visible)]="showNewTransferDialog" 
        [modal]="true" 
        [style]="{width: '600px'}">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Entrepôt source</label>
              <p-dropdown 
                [(ngModel)]="newTransfer().sourceWarehouseId"
                [options]="warehouseOptions"
                placeholder="Sélectionner"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Entrepôt destination</label>
              <p-dropdown 
                [(ngModel)]="newTransfer().destinationWarehouseId"
                [options]="warehouseOptions"
                placeholder="Sélectionner"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              pInputTextarea 
              [(ngModel)]="newTransfer().notes"
              rows="3"
              class="w-full">
            </textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex gap-2">
            <p-button 
              label="Annuler" 
              [text]="true"
              (onClick)="showNewTransferDialog.set(false)">
            </p-button>
            <p-button 
              label="Créer" 
              (onClick)="createTransfer()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class TransfersComponent implements OnInit {
  transfers = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  selectedSourceWarehouse = signal<string>('');
  selectedDestWarehouse = signal<string>('');
  showNewTransferDialog = signal<boolean>(false);
  
  newTransfer = signal<any>({
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    notes: ''
  });

  statusOptions = [
    { label: 'En attente', value: 'pending' },
    { label: 'Approuvé', value: 'approved' },
    { label: 'En transit', value: 'in_transit' },
    { label: 'Terminé', value: 'completed' },
    { label: 'Annulé', value: 'cancelled' }
  ];

  warehouseOptions = [
    { label: 'Entrepôt Principal', value: '1' },
    { label: 'Magasin Showroom', value: '2' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadTransfers();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getStatusLabel(status: TransferStatus): string {
    const labels: Record<TransferStatus, string> = {
      [TransferStatus.PENDING]: 'En attente',
      [TransferStatus.APPROVED]: 'Approuvé',
      [TransferStatus.IN_TRANSIT]: 'En transit',
      [TransferStatus.COMPLETED]: 'Terminé',
      [TransferStatus.CANCELLED]: 'Annulé'
    };
    return labels[status];
  }

  getStatusSeverity(status: TransferStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case TransferStatus.COMPLETED:
        return 'success';
      case TransferStatus.APPROVED:
      case TransferStatus.IN_TRANSIT:
        return 'info';
      case TransferStatus.PENDING:
        return 'warning';
      case TransferStatus.CANCELLED:
        return 'danger';
      default:
        return 'info';
    }
  }

  createTransfer() {
    console.log('Creating transfer:', this.newTransfer());
    this.showNewTransferDialog.set(false);
    this.newTransfer.set({
      sourceWarehouseId: '',
      destinationWarehouseId: '',
      notes: ''
    });
  }

  private loadTransfers() {
    const mockTransfers = [
      {
        id: '1',
        transferNumber: 'TR-2024-0001',
        sourceWarehouse: 'Entrepôt Principal',
        destinationWarehouse: 'Magasin Showroom',
        itemCount: 5,
        status: TransferStatus.PENDING,
        requestedBy: 'Jean Dupont',
        requestedAt: new Date()
      },
      {
        id: '2',
        transferNumber: 'TR-2024-0002',
        sourceWarehouse: 'Magasin Showroom',
        destinationWarehouse: 'Entrepôt Principal',
        itemCount: 3,
        status: TransferStatus.COMPLETED,
        requestedBy: 'Marie Kouassi',
        requestedAt: new Date(Date.now() - 86400000)
      }
    ];

    this.transfers.set(mockTransfers);
  }
}