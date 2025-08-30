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
import { InputNumberModule } from 'primeng/inputnumber';

import { TranslationService } from '../../../core/services/translation.service';
import { StockAdjustment, AdjustmentType } from '../../../core/models/stock.model';

@Component({
  selector: 'app-adjustments',
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
    InputNumberModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.adjustments') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Ajustements de stock et corrections d'inventaire
          </p>
        </div>
        <p-button 
          label="Nouvel ajustement" 
          icon="pi pi-plus"
          (onClick)="showNewAdjustmentDialog.set(true)">
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
              placeholder="N° ajustement, produit..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="selectedType"
            [options]="typeOptions"
            placeholder="Type d'ajustement"
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

      <!-- Adjustments Table -->
      <p-card>
        <p-table 
          [value]="adjustments()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Ajustement</th>
              <th>Type</th>
              <th>Entrepôt</th>
              <th>Articles</th>
              <th>Valeur totale</th>
              <th>Motif</th>
              <th>Date</th>
              <th>Créé par</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-adjustment>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ adjustment.adjustmentNumber }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getTypeLabel(adjustment.type)" 
                  [severity]="getTypeSeverity(adjustment.type)">
                </p-tag>
              </td>
              <td>{{ adjustment.warehouse }}</td>
              <td>{{ adjustment.itemCount }} article(s)</td>
              <td class="text-right">
                <span [class]="adjustment.totalValue >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ adjustment.totalValue | currency:'XOF':'symbol':'1.0-0' }}
                </span>
              </td>
              <td>{{ adjustment.reason }}</td>
              <td>{{ adjustment.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ adjustment.createdBy }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button 
                    *ngIf="!adjustment.approvedAt"
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

      <!-- New Adjustment Dialog -->
      <p-dialog 
        header="Nouvel ajustement de stock" 
        [(visible)]="showNewAdjustmentDialog" 
        [modal]="true" 
        [style]="{width: '700px'}">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Type d'ajustement</label>
              <p-dropdown 
                [(ngModel)]="newAdjustment().type"
                [options]="typeOptions"
                placeholder="Sélectionner"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Entrepôt</label>
              <p-dropdown 
                [(ngModel)]="newAdjustment().warehouseId"
                [options]="warehouseOptions"
                placeholder="Sélectionner"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Motif</label>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="newAdjustment().reason"
              placeholder="Motif de l'ajustement"
              class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              pInputTextarea 
              [(ngModel)]="newAdjustment().notes"
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
              (onClick)="showNewAdjustmentDialog.set(false)">
            </p-button>
            <p-button 
              label="Créer" 
              (onClick)="createAdjustment()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class AdjustmentsComponent implements OnInit {
  adjustments = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedWarehouse = signal<string>('');
  showNewAdjustmentDialog = signal<boolean>(false);
  
  newAdjustment = signal<any>({
    type: '',
    warehouseId: '',
    reason: '',
    notes: ''
  });

  typeOptions = [
    { label: 'Augmentation', value: 'increase' },
    { label: 'Diminution', value: 'decrease' },
    { label: 'Recomptage', value: 'recount' }
  ];

  warehouseOptions = [
    { label: 'Entrepôt Principal', value: '1' },
    { label: 'Magasin Showroom', value: '2' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadAdjustments();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getTypeLabel(type: AdjustmentType): string {
    const labels: Record<AdjustmentType, string> = {
      [AdjustmentType.INCREASE]: 'Augmentation',
      [AdjustmentType.DECREASE]: 'Diminution',
      [AdjustmentType.RECOUNT]: 'Recomptage'
    };
    return labels[type];
  }

  getTypeSeverity(type: AdjustmentType): 'success' | 'info' | 'warning' | 'danger' {
    switch (type) {
      case AdjustmentType.INCREASE:
        return 'success';
      case AdjustmentType.DECREASE:
        return 'danger';
      case AdjustmentType.RECOUNT:
        return 'info';
      default:
        return 'info';
    }
  }

  createAdjustment() {
    console.log('Creating adjustment:', this.newAdjustment());
    this.showNewAdjustmentDialog.set(false);
    this.newAdjustment.set({
      type: '',
      warehouseId: '',
      reason: '',
      notes: ''
    });
  }

  private loadAdjustments() {
    const mockAdjustments = [
      {
        id: '1',
        adjustmentNumber: 'ADJ-2024-0001',
        type: AdjustmentType.DECREASE,
        warehouse: 'Entrepôt Principal',
        itemCount: 2,
        totalValue: -45000,
        reason: 'Produits endommagés',
        createdBy: 'Jean Dupont',
        createdAt: new Date(),
        approvedAt: new Date()
      },
      {
        id: '2',
        adjustmentNumber: 'ADJ-2024-0002',
        type: AdjustmentType.INCREASE,
        warehouse: 'Magasin Showroom',
        itemCount: 1,
        totalValue: 15000,
        reason: 'Erreur de comptage',
        createdBy: 'Marie Kouassi',
        createdAt: new Date(Date.now() - 3600000),
        approvedAt: null
      }
    ];

    this.adjustments.set(mockAdjustments);
  }
}