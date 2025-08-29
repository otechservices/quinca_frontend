import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';

import { TranslationService } from '../../../core/services/translation.service';
import { Product, MOCK_CATEGORIES, MOCK_BRANDS } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    CardModule,
    BadgeModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('products.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez votre catalogue de produits
          </p>
        </div>
        <p-button 
          label="Nouveau produit" 
          icon="pi pi-plus" 
          routerLink="/products/new">
        </p-button>
      </div>

      <!-- Filters Card -->
      <p-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Recherche</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="searchTerm"
                placeholder="Nom, code, marque..."
                class="w-full"
                (input)="applyFilters()">
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Catégorie</label>
            <p-dropdown 
              [(ngModel)]="selectedCategory"
              [options]="categoryOptions"
              placeholder="Toutes les catégories"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full"
              (onChange)="applyFilters()">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Marque</label>
            <p-dropdown 
              [(ngModel)]="selectedBrand"
              [options]="brandOptions"
              placeholder="Toutes les marques"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full"
              (onChange)="applyFilters()">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Statut</label>
            <p-dropdown 
              [(ngModel)]="selectedStatus"
              [options]="statusOptions"
              placeholder="Tous les statuts"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full"
              (onChange)="applyFilters()">
            </p-dropdown>
          </div>
        </div>
      </p-card>

      <!-- Products Table -->
      <p-card>
        <p-table 
          [value]="filteredProducts()" 
          [paginator]="true" 
          [rows]="20"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} produits"
          [rowsPerPageOptions]="[10, 20, 50]"
          [globalFilterFields]="['name', 'code', 'brand', 'category']"
          styleClass="p-datatable-sm"
          [scrollable]="true"
          scrollHeight="600px">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th pSortableColumn="code">
                Code
                <p-sortIcon field="code"></p-sortIcon>
              </th>
              <th pSortableColumn="name">
                Nom du produit
                <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th>Catégorie</th>
              <th>Marque</th>
              <th pSortableColumn="salePriceHT">
                Prix de vente
                <p-sortIcon field="salePriceHT"></p-sortIcon>
              </th>
              <th>Stock</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-product let-rowIndex="rowIndex">
            <tr>
              <td>
                <p-tableCheckbox [value]="product"></p-tableCheckbox>
              </td>
              <td>
                <span class="font-mono text-sm">{{ product.code }}</span>
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <i class="pi pi-box text-gray-500"></i>
                  </div>
                  <div>
                    <div class="font-medium">{{ product.name }}</div>
                    <div class="text-sm text-gray-500" *ngIf="product.shortDescription">
                      {{ product.shortDescription }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <p-tag [value]="product.category" severity="info"></p-tag>
              </td>
              <td>{{ product.brand || '-' }}</td>
              <td>
                <div class="text-right">
                  <div class="font-medium">{{ product.salePriceHT | currency:'XOF':'symbol':'1.0-0' }}</div>
                  <div class="text-sm text-gray-500">HT</div>
                </div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <p-badge 
                    [value]="product.stock.toString()" 
                    [severity]="getStockSeverity(product.stock, product.reorderThreshold)">
                  </p-badge>
                  <i 
                    *ngIf="product.stock <= product.reorderThreshold"
                    class="pi pi-exclamation-triangle text-red-500"
                    pTooltip="Stock faible">
                  </i>
                </div>
              </td>
              <td>
                <p-tag 
                  [value]="product.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="product.isActive ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button 
                    icon="pi pi-eye" 
                    [text]="true" 
                    size="small"
                    [routerLink]="['/products', product.id]"
                    pTooltip="Voir">
                  </p-button>
                  <p-button 
                    icon="pi pi-pencil" 
                    [text]="true" 
                    size="small"
                    [routerLink]="['/products', product.id, 'edit']"
                    pTooltip="Modifier">
                  </p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    [text]="true" 
                    size="small"
                    severity="danger"
                    (onClick)="deleteProduct(product)"
                    pTooltip="Supprimer">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center py-8">
                <div class="text-gray-500">
                  <i class="pi pi-inbox text-4xl mb-4"></i>
                  <p>Aucun produit trouvé</p>
                  <p class="text-sm">Ajoutez votre premier produit pour commencer</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  // Signals
  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedBrand = signal<string>('');
  selectedStatus = signal<string>('');

  // Computed
  filteredProducts = computed(() => {
    let filtered = this.products();
    
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search) ||
        (p.brand && p.brand.toLowerCase().includes(search))
      );
    }

    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.category === this.selectedCategory());
    }

    if (this.selectedBrand()) {
      filtered = filtered.filter(p => p.brand === this.selectedBrand());
    }

    if (this.selectedStatus()) {
      const isActive = this.selectedStatus() === 'active';
      filtered = filtered.filter(p => p.isActive === isActive);
    }

    return filtered;
  });

  // Options
  categoryOptions = MOCK_CATEGORIES.map(cat => ({ label: cat, value: cat }));
  brandOptions = MOCK_BRANDS.map(brand => ({ label: brand, value: brand }));
  statusOptions = [
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadProducts();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  applyFilters() {
    // Filters are applied automatically through computed signal
  }

getStockSeverity(stock: number, reorderThreshold: number): 'success' | 'warning' | 'danger' {
  if (stock === 0) {
    return 'danger';
  } else if (stock < reorderThreshold) {
    return 'warning';
  } else {
    return 'success';
  }
}


  deleteProduct(product: Product) {
    // Implement delete functionality
    console.log('Delete product:', product);
  }

  private loadProducts() {
    // Mock data - replace with real API call
    const mockProducts: Product[] = [
      {
        id: '1',
        code: 'PRD-2024-0001',
        name: 'Ciment Portland 50kg',
        slug: 'ciment-portland-50kg',
        categoryId: '1',
        category: 'Ciment et Béton',
        brand: 'Lafarge',
        shortDescription: 'Ciment de haute qualité pour construction',
        longDescription: 'Ciment Portland de qualité supérieure, idéal pour tous types de construction. Résistance élevée et prise rapide.',
        baseUnitId: '1',
        relatedUnits: [],
        variants: [],
        purchasePriceHT: 12000,
        salePriceHT: 15000,
        vatRate: 18,
        salePriceTTC: 17700,
        marginPercent: 25,
        maxDiscountPercent: 10,
        barcodes: ['3456789012345'],
        images: [],
        isActive: true,
        reorderThreshold: 50,
        weight: 50,
        customFields: {},
        stock: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'PRD-2024-0002',
        name: 'Clous 10cm (1kg)',
        slug: 'clous-10cm-1kg',
        categoryId: '2',
        category: 'Quincaillerie',
        brand: 'Stanley',
        shortDescription: 'Clous galvanisés 10cm',
        longDescription: 'Clous galvanisés de 10cm, résistants à la corrosion. Parfaits pour la charpente et la construction.',
        baseUnitId: '2',
        relatedUnits: [],
        variants: [],
        purchasePriceHT: 4000,
        salePriceHT: 5000,
        vatRate: 18,
        salePriceTTC: 5900,
        marginPercent: 25,
        maxDiscountPercent: 5,
        barcodes: ['3456789012346'],
        images: [],
        isActive: true,
        reorderThreshold: 20,
        weight: 1,
        customFields: {},
        stock: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        code: 'PRD-2024-0003',
        name: 'Peinture Blanche 5L',
        slug: 'peinture-blanche-5l',
        categoryId: '3',
        category: 'Peinture',
        brand: 'Dulux',
        shortDescription: 'Peinture acrylique blanche mate',
        longDescription: 'Peinture acrylique blanche mate de haute qualité. Excellent pouvoir couvrant et finition parfaite.',
        baseUnitId: '3',
        relatedUnits: [],
        variants: [],
        purchasePriceHT: 12000,
        salePriceHT: 15000,
        vatRate: 18,
        salePriceTTC: 17700,
        marginPercent: 25,
        maxDiscountPercent: 15,
        barcodes: ['3456789012347'],
        images: [],
        isActive: true,
        reorderThreshold: 15,
        volume: 5,
        customFields: {},
        stock: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        code: 'PRD-2024-0004',
        name: 'Vis Inox 6x40 (100pcs)',
        slug: 'vis-inox-6x40-100pcs',
        categoryId: '2',
        category: 'Quincaillerie',
        brand: 'Bosch',
        shortDescription: 'Vis inoxydables 6x40mm',
        longDescription: 'Vis en acier inoxydable 6x40mm. Résistantes à la corrosion, idéales pour l\'extérieur.',
        baseUnitId: '4',
        relatedUnits: [],
        variants: [],
        purchasePriceHT: 4000,
        salePriceHT: 5000,
        vatRate: 18,
        salePriceTTC: 5900,
        marginPercent: 25,
        maxDiscountPercent: 10,
        barcodes: ['3456789012348'],
        images: [],
        isActive: true,
        reorderThreshold: 20,
        customFields: {},
        stock: 5, // Low stock
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        code: 'PRD-2024-0005',
        name: 'Robinet Cuisine Chrome',
        slug: 'robinet-cuisine-chrome',
        categoryId: '4',
        category: 'Plomberie',
        brand: 'Grohe',
        shortDescription: 'Robinet mitigeur cuisine',
        longDescription: 'Robinet mitigeur pour cuisine en chrome. Design moderne et fonctionnel.',
        baseUnitId: '1',
        relatedUnits: [],
        variants: [],
        purchasePriceHT: 25000,
        salePriceHT: 35000,
        vatRate: 18,
        salePriceTTC: 41300,
        marginPercent: 40,
        maxDiscountPercent: 20,
        barcodes: ['3456789012349'],
        images: [],
        isActive: true,
        reorderThreshold: 10,
        customFields: {},
        stock: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.products.set(mockProducts);
  }
}