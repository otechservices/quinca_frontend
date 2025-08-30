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
import { ChipsModule } from 'primeng/chips';

import { TranslationService } from '../../../core/services/translation.service';
import { ProductVariant } from '../../../core/models/product.model';

@Component({
  selector: 'app-variant-list',
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
    ChipsModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.variants') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les variantes de produits (couleurs, tailles, etc.)
          </p>
        </div>
        <p-button 
          label="Nouvelle variante" 
          icon="pi pi-plus"
          (onClick)="showNewVariantDialog.set(true)">
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
              placeholder="SKU, produit..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="selectedProduct"
            [options]="productOptions"
            placeholder="Produit"
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
        </div>
      </p-card>

      <!-- Variants Table -->
      <p-card>
        <p-table 
          [value]="variants()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>SKU</th>
              <th>Produit parent</th>
              <th>Attributs</th>
              <th>Code-barres</th>
              <th>Prix d'achat</th>
              <th>Prix de vente</th>
              <th>Stock</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-variant>
            <tr>
              <td>
                <span class="font-mono text-sm font-medium">{{ variant.sku }}</span>
              </td>
              <td>
                <div>
                  <div class="font-medium">{{ variant.productName }}</div>
                  <div class="text-sm text-gray-500">{{ variant.productCode }}</div>
                </div>
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <p-tag 
                    *ngFor="let attr of variant.attributesList" 
                    [value]="attr" 
                    severity="info"
                    class="text-xs">
                  </p-tag>
                </div>
              </td>
              <td>
                <span class="font-mono text-sm">{{ variant.barcode || '-' }}</span>
              </td>
              <td class="text-right">
                {{ variant.purchasePriceHT | currency:'XOF':'symbol':'1.0-0' }}
              </td>
              <td class="text-right">
                {{ variant.salePriceHT | currency:'XOF':'symbol':'1.0-0' }}
              </td>
              <td>
                <p-tag 
                  [value]="variant.stock?.toString() || '0'" 
                  [severity]="getStockSeverity(variant.stock)">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="variant.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="variant.isActive ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-pencil" [text]="true" size="small" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" pTooltip="Supprimer"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- New Variant Dialog -->
      <p-dialog 
        header="Nouvelle variante de produit" 
        [(visible)]="showNewVariantDialog" 
        [modal]="true" 
        [style]="{width: '700px'}">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Produit parent</label>
            <p-dropdown 
              [(ngModel)]="newVariant().productId"
              [options]="productOptions"
              placeholder="Sélectionner un produit"
              optionLabel="label"
              optionValue="value"
              class="w-full">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">SKU</label>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="newVariant().sku"
              placeholder="SKU unique pour cette variante"
              class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Attributs (couleur, taille, etc.)</label>
            <p-chips 
              [(ngModel)]="newVariant().attributes"
              placeholder="Ajouter un attribut (ex: Rouge, Taille M)"
              class="w-full">
            </p-chips>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Prix d'achat HT</label>
              <p-inputNumber 
                [(ngModel)]="newVariant().purchasePriceHT"
                mode="currency" 
                currency="XOF"
                locale="fr-FR"
                class="w-full">
              </p-inputNumber>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Prix de vente HT</label>
              <p-inputNumber 
                [(ngModel)]="newVariant().salePriceHT"
                mode="currency" 
                currency="XOF"
                locale="fr-FR"
                class="w-full">
              </p-inputNumber>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Code-barres (optionnel)</label>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="newVariant().barcode"
              placeholder="Code-barres spécifique à cette variante"
              class="w-full">
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex gap-2">
            <p-button 
              label="Annuler" 
              [text]="true"
              (onClick)="showNewVariantDialog.set(false)">
            </p-button>
            <p-button 
              label="Créer la variante" 
              (onClick)="createVariant()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class VariantListComponent implements OnInit {
  variants = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedProduct = signal<string>('');
  selectedStatus = signal<string>('');
  showNewVariantDialog = signal<boolean>(false);
  
  newVariant = signal<any>({
    productId: '',
    sku: '',
    attributes: [],
    purchasePriceHT: 0,
    salePriceHT: 0,
    barcode: ''
  });

  productOptions = [
    { label: 'Ciment Portland 50kg', value: '1' },
    { label: 'Peinture Blanche 5L', value: '3' },
    { label: 'Robinet Cuisine', value: '5' }
  ];

  statusOptions = [
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadVariants();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getStockSeverity(stock: number): 'success' | 'warning' | 'danger' {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  createVariant() {
    console.log('Creating variant:', this.newVariant());
    this.showNewVariantDialog.set(false);
    this.newVariant.set({
      productId: '',
      sku: '',
      attributes: [],
      purchasePriceHT: 0,
      salePriceHT: 0,
      barcode: ''
    });
  }

  private loadVariants() {
    const mockVariants = [
      {
        id: '1',
        sku: 'PAINT-WHITE-5L-MAT',
        productName: 'Peinture Blanche 5L',
        productCode: 'PRD-2024-0003',
        attributes: { finish: 'Mat', size: '5L' },
        attributesList: ['Mat', '5L'],
        barcode: '3456789012347-1',
        purchasePriceHT: 12000,
        salePriceHT: 15000,
        stock: 15,
        isActive: true
      },
      {
        id: '2',
        sku: 'PAINT-WHITE-5L-SAT',
        productName: 'Peinture Blanche 5L',
        productCode: 'PRD-2024-0003',
        attributes: { finish: 'Satiné', size: '5L' },
        attributesList: ['Satiné', '5L'],
        barcode: '3456789012347-2',
        purchasePriceHT: 13000,
        salePriceHT: 16000,
        stock: 8,
        isActive: true
      },
      {
        id: '3',
        sku: 'TAP-KITCHEN-CHR-STD',
        productName: 'Robinet Cuisine',
        productCode: 'PRD-2024-0005',
        attributes: { color: 'Chrome', type: 'Standard' },
        attributesList: ['Chrome', 'Standard'],
        barcode: '3456789012349-1',
        purchasePriceHT: 25000,
        salePriceHT: 35000,
        stock: 12,
        isActive: true
      }
    ];

    this.variants.set(mockVariants);
  }
}