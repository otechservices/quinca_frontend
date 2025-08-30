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

export enum ReturnType {
  SALE_RETURN = 'sale_return',
  PURCHASE_RETURN = 'purchase_return'
}

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  REJECTED = 'rejected'
}

@Component({
  selector: 'app-return-list',
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
            {{ t('navigation.returns') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des retours clients et fournisseurs
          </p>
        </div>
        <div class="flex gap-2">
          <p-button 
            label="Retour client" 
            icon="pi pi-replay"
            (onClick)="openSaleReturnDialog()">
          </p-button>
          <p-button 
            label="Retour fournisseur" 
            icon="pi pi-undo"
            severity="secondary"
            (onClick)="openPurchaseReturnDialog()">
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
              placeholder="N° retour, client..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="selectedType"
            [options]="typeOptions"
            placeholder="Type de retour"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
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
            [(ngModel)]="selectedDate"
            class="w-full">
        </div>
      </p-card>

      <!-- Returns Table -->
      <p-card>
        <p-table 
          [value]="returns()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Retour</th>
              <th>Type</th>
              <th>Client/Fournisseur</th>
              <th>Référence origine</th>
              <th>Date</th>
              <th>Articles</th>
              <th>Montant</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-return>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ return.returnNumber }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getTypeLabel(return.type)" 
                  [severity]="return.type === 'sale_return' ? 'warning' : 'info'">
                </p-tag>
              </td>
              <td>{{ return.customerSupplier }}</td>
              <td>
                <span class="font-mono text-sm">{{ return.originalReference }}</span>
              </td>
              <td>{{ return.returnDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ return.itemCount }} article(s)</td>
              <td class="text-right">
                <span class="font-medium">{{ return.totalAmount | currency:'XOF':'symbol':'1.0-0' }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(return.status)" 
                  [severity]="getStatusSeverity(return.status)">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button 
                    *ngIf="return.status === 'pending'"
                    icon="pi pi-check" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Approuver">
                  </p-button>
                  <p-button icon="pi pi-print" [text]="true" size="small" pTooltip="Imprimer"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- New Return Dialog -->
      <p-dialog 
        [header]="newReturn().type === 'sale_return' ? 'Nouveau retour client' : 'Nouveau retour fournisseur'" 
        [(visible)]="showNewReturnDialog" 
        [modal]="true" 
        [style]="{width: '600px'}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ newReturn().type === 'sale_return' ? 'Vente d&apos;origine' : 'Achat d&apos;origine' }}
            </label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="newReturn().originalReference"
                [placeholder]="getOriginalReferencePlaceholder()"
                class="w-full">
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Motif du retour</label>
            <p-dropdown 
              [(ngModel)]="newReturn().reason"
              [options]="reasonOptions"
              placeholder="Sélectionner un motif"
              optionLabel="label"
              optionValue="value"
              class="w-full">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              pInputTextarea 
              [(ngModel)]="newReturn().notes"
              rows="3"
              placeholder="Détails du retour..."
              class="w-full">
            </textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex gap-2">
            <p-button 
              label="Annuler" 
              [text]="true"
              (onClick)="showNewReturnDialog.set(false)">
            </p-button>
            <p-button 
              label="Créer le retour" 
              (onClick)="createReturn()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class ReturnListComponent implements OnInit {
  returns = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedStatus = signal<string>('');
  selectedDate = signal<string>('');
  showNewReturnDialog = signal<boolean>(false);
  
  newReturn = signal<any>({
    type: 'sale_return',
    originalReference: '',
    reason: '',
    notes: ''
  });

  typeOptions = [
    { label: 'Retour client', value: 'sale_return' },
    { label: 'Retour fournisseur', value: 'purchase_return' }
  ];

  statusOptions = [
    { label: 'En attente', value: 'pending' },
    { label: 'Approuvé', value: 'approved' },
    { label: 'Traité', value: 'processed' },
    { label: 'Rejeté', value: 'rejected' }
  ];

  reasonOptions = [
    { label: 'Produit défectueux', value: 'defective' },
    { label: 'Erreur de commande', value: 'wrong_order' },
    { label: 'Produit endommagé', value: 'damaged' },
    { label: 'Non conforme', value: 'non_compliant' },
    { label: 'Autre', value: 'other' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadReturns();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  openSaleReturnDialog() {
    this.newReturn.set({
      type: 'sale_return',
      originalReference: '',
      reason: '',
      notes: ''
    });
    this.showNewReturnDialog.set(true);
  }

  openPurchaseReturnDialog() {
    this.newReturn.set({
      type: 'purchase_return',
      originalReference: '',
      reason: '',
      notes: ''
    });
    this.showNewReturnDialog.set(true);
  }

  getOriginalReferencePlaceholder(): string {
    return this.newReturn().type === 'sale_return' 
      ? 'N° de vente (SO-YYYY-####)' 
      : 'N° d\'achat (PO-YYYY-####)';
  }

  getTypeLabel(type: ReturnType): string {
    const labels: Record<ReturnType, string> = {
      [ReturnType.SALE_RETURN]: 'Retour client',
      [ReturnType.PURCHASE_RETURN]: 'Retour fournisseur'
    };
    return labels[type];
  }

  getStatusLabel(status: ReturnStatus): string {
    const labels: Record<ReturnStatus, string> = {
      [ReturnStatus.PENDING]: 'En attente',
      [ReturnStatus.APPROVED]: 'Approuvé',
      [ReturnStatus.PROCESSED]: 'Traité',
      [ReturnStatus.REJECTED]: 'Rejeté'
    };
    return labels[status];
  }

  getStatusSeverity(status: ReturnStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case ReturnStatus.PROCESSED:
        return 'success';
      case ReturnStatus.APPROVED:
        return 'info';
      case ReturnStatus.PENDING:
        return 'warning';
      case ReturnStatus.REJECTED:
        return 'danger';
      default:
        return 'info';
    }
  }

  createReturn() {
    console.log('Creating return:', this.newReturn());
    this.showNewReturnDialog.set(false);
    this.newReturn.set({
      type: 'sale_return',
      originalReference: '',
      reason: '',
      notes: ''
    });
  }

  private loadReturns() {
    const mockReturns = [
      {
        id: '1',
        returnNumber: 'RET-2024-0001',
        type: ReturnType.SALE_RETURN,
        customerSupplier: 'Marie Adjovi',
        originalReference: 'SO-2024-0145',
        returnDate: new Date(),
        itemCount: 2,
        totalAmount: 35000,
        status: ReturnStatus.PENDING
      },
      {
        id: '2',
        returnNumber: 'RET-2024-0002',
        type: ReturnType.PURCHASE_RETURN,
        customerSupplier: 'Lafarge Holcim',
        originalReference: 'PO-2024-0012',
        returnDate: new Date(Date.now() - 86400000),
        itemCount: 1,
        totalAmount: 150000,
        status: ReturnStatus.PROCESSED
      }
    ];

    this.returns.set(mockReturns);
  }
}