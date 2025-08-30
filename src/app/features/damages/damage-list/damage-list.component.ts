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

export enum DamageType {
  BREAKAGE = 'breakage',
  EXPIRY = 'expiry',
  THEFT = 'theft',
  LOSS = 'loss',
  OBSOLETE = 'obsolete'
}

export enum DamageStatus {
  REPORTED = 'reported',
  INVESTIGATED = 'investigated',
  APPROVED = 'approved',
  WRITTEN_OFF = 'written_off'
}

@Component({
  selector: 'app-damage-list',
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
            {{ t('navigation.damages') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des pertes, casse et produits endommagés
          </p>
        </div>
        <p-button 
          label="Déclarer une perte" 
          icon="pi pi-plus"
          (onClick)="showNewDamageDialog.set(true)">
        </p-button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <i class="pi pi-exclamation-triangle text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pertes ce mois</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">125,000 XOF</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <i class="pi pi-clock text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Produits expirés</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <i class="pi pi-ban text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Obsolètes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                <i class="pi pi-eye-slash text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Vols déclarés</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Damages Table -->
      <p-card>
        <p-table 
          [value]="damages()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>N° Déclaration</th>
              <th>Type</th>
              <th>Produit</th>
              <th>Entrepôt</th>
              <th>Quantité</th>
              <th>Valeur</th>
              <th>Date</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-damage>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ damage.damageNumber }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="getTypeLabel(damage.type)" 
                  [severity]="getTypeSeverity(damage.type)">
                </p-tag>
              </td>
              <td>
                <div>
                  <div class="font-medium">{{ damage.product }}</div>
                  <div class="text-sm text-gray-500">{{ damage.productCode }}</div>
                </div>
              </td>
              <td>{{ damage.warehouse }}</td>
              <td>{{ damage.quantity }}</td>
              <td class="text-right">
                <span class="font-medium text-red-600">{{ damage.value | currency:'XOF':'symbol':'1.0-0' }}</span>
              </td>
              <td>{{ damage.reportedAt | date:'dd/MM/yyyy' }}</td>
              <td>
                <p-tag 
                  [value]="getStatusLabel(damage.status)" 
                  [severity]="getStatusSeverity(damage.status)">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
                  <p-button 
                    *ngIf="damage.status === 'reported'"
                    icon="pi pi-search" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Enquêter">
                  </p-button>
                  <p-button 
                    *ngIf="damage.status === 'investigated'"
                    icon="pi pi-check" 
                    [text]="true" 
                    size="small" 
                    pTooltip="Approuver">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- New Damage Dialog -->
      <p-dialog 
        header="Déclarer une perte ou casse" 
        [(visible)]="showNewDamageDialog" 
        [modal]="true" 
        [style]="{width: '600px'}">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Type de perte</label>
              <p-dropdown 
                [(ngModel)]="newDamage().type"
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
                [(ngModel)]="newDamage().warehouseId"
                [options]="warehouseOptions"
                placeholder="Sélectionner"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Produit</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="newDamage().productSearch"
                placeholder="Rechercher un produit..."
                class="w-full">
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Quantité perdue</label>
            <p-inputNumber 
              [(ngModel)]="newDamage().quantity"
              [min]="1"
              class="w-full">
            </p-inputNumber>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea 
              pInputTextarea 
              [(ngModel)]="newDamage().description"
              rows="3"
              placeholder="Décrivez les circonstances..."
              class="w-full">
            </textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex gap-2">
            <p-button 
              label="Annuler" 
              [text]="true"
              (onClick)="showNewDamageDialog.set(false)">
            </p-button>
            <p-button 
              label="Déclarer" 
              (onClick)="createDamage()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class DamageListComponent implements OnInit {
  damages = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedStatus = signal<string>('');
  selectedDate = signal<string>('');
  showNewDamageDialog = signal<boolean>(false);
  
  newDamage = signal<any>({
    type: '',
    warehouseId: '',
    productSearch: '',
    quantity: 1,
    description: ''
  });

  typeOptions = [
    { label: 'Casse', value: 'breakage' },
    { label: 'Expiration', value: 'expiry' },
    { label: 'Vol', value: 'theft' },
    { label: 'Perte', value: 'loss' },
    { label: 'Obsolète', value: 'obsolete' }
  ];

  statusOptions = [
    { label: 'Déclaré', value: 'reported' },
    { label: 'Enquête', value: 'investigated' },
    { label: 'Approuvé', value: 'approved' },
    { label: 'Passé en perte', value: 'written_off' }
  ];

  warehouseOptions = [
    { label: 'Entrepôt Principal', value: '1' },
    { label: 'Magasin Showroom', value: '2' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadDamages();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getTypeLabel(type: DamageType): string {
    const labels: Record<DamageType, string> = {
      [DamageType.BREAKAGE]: 'Casse',
      [DamageType.EXPIRY]: 'Expiration',
      [DamageType.THEFT]: 'Vol',
      [DamageType.LOSS]: 'Perte',
      [DamageType.OBSOLETE]: 'Obsolète'
    };
    return labels[type];
  }

  getTypeSeverity(type: DamageType): 'success' | 'info' | 'warning' | 'danger' {
    switch (type) {
      case DamageType.EXPIRY:
      case DamageType.OBSOLETE:
        return 'warning';
      case DamageType.THEFT:
      case DamageType.LOSS:
        return 'danger';
      case DamageType.BREAKAGE:
        return 'info';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: DamageStatus): string {
    const labels: Record<DamageStatus, string> = {
      [DamageStatus.REPORTED]: 'Déclaré',
      [DamageStatus.INVESTIGATED]: 'Enquête',
      [DamageStatus.APPROVED]: 'Approuvé',
      [DamageStatus.WRITTEN_OFF]: 'Passé en perte'
    };
    return labels[status];
  }

  getStatusSeverity(status: DamageStatus): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case DamageStatus.WRITTEN_OFF:
        return 'success';
      case DamageStatus.APPROVED:
        return 'info';
      case DamageStatus.INVESTIGATED:
        return 'warning';
      case DamageStatus.REPORTED:
        return 'danger';
      default:
        return 'info';
    }
  }

  createDamage() {
    console.log('Creating damage report:', this.newDamage());
    this.showNewDamageDialog.set(false);
    this.newDamage.set({
      type: '',
      warehouseId: '',
      productSearch: '',
      quantity: 1,
      description: ''
    });
  }

  private loadDamages() {
    const mockDamages = [
      {
        id: '1',
        damageNumber: 'DMG-2024-0001',
        type: DamageType.BREAKAGE,
        product: 'Peinture Blanche 5L',
        productCode: 'PRD-2024-0003',
        warehouse: 'Entrepôt Principal',
        quantity: 3,
        value: 45000,
        status: DamageStatus.REPORTED,
        reportedAt: new Date()
      },
      {
        id: '2',
        damageNumber: 'DMG-2024-0002',
        type: DamageType.EXPIRY,
        product: 'Colle Carrelage 25kg',
        productCode: 'PRD-2024-0015',
        warehouse: 'Magasin Showroom',
        quantity: 2,
        value: 30000,
        status: DamageStatus.WRITTEN_OFF,
        reportedAt: new Date(Date.now() - 172800000)
      }
    ];

    this.damages.set(mockDamages);
  }
}