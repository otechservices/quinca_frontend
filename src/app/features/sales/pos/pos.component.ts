import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';

import { TranslationService } from '../../../core/services/translation.service';
import { Product } from '../../../core/models/product.model';
import { POSCartItem, PaymentMethod } from '../../../core/models/sale.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DropdownModule,
    InputNumberModule,
    DialogModule,
    TabViewModule
  ],
  template: `
    <div class="h-screen flex flex-col bg-surface-50">
      <!-- POS Header -->
      <div class="bg-white dark:bg-surface-900 border-b border-surface-200 px-6 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold text-surface-900 dark:text-surface-0">
            Point de Vente
          </h1>
          <div class="flex gap-2">
            <p-button label="Nouvelle session" icon="pi pi-play" [outlined]="true"></p-button>
            <p-button label="Fermer session" icon="pi pi-stop" severity="danger" [outlined]="true"></p-button>
          </div>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel - Product Search & Grid -->
        <div class="flex-1 flex flex-col p-4">
          <!-- Search -->
          <div class="mb-4">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="searchTerm"
                placeholder="Rechercher un produit (nom, code, code-barres)..."
                class="w-full"
                (keyup.enter)="searchProducts()">
            </span>
          </div>

          <!-- Product Grid -->
          <div class="flex-1 overflow-auto">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div 
                *ngFor="let product of filteredProducts()" 
                class="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                (click)="addToCart(product)">
                <div class="text-center">
                  <div class="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i class="pi pi-box text-2xl text-surface-500"></i>
                  </div>
                  <h3 class="font-medium text-sm mb-1 line-clamp-2">{{ product.name }}</h3>
                  <p class="text-xs text-surface-500 mb-2">{{ product.code }}</p>
                  <p class="font-bold text-primary-600">{{ product.salePriceHT | currency:'XOF':'symbol':'1.0-0' }}</p>
                  <p class="text-xs text-surface-500">Stock: {{ product.stock }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Cart & Payment -->
        <div class="w-96 bg-white dark:bg-surface-900 border-l border-surface-200 flex flex-col">
          <!-- Cart Header -->
          <div class="p-4 border-b border-surface-200">
            <h2 class="text-lg font-semibold">Panier</h2>
            <p class="text-sm text-surface-500">{{ cartItems().length }} article(s)</p>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-auto p-4">
            <div class="space-y-3">
              <div 
                *ngFor="let item of cartItems()" 
                class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <div class="w-10 h-10 bg-surface-200 dark:bg-surface-700 rounded flex items-center justify-center">
                  <i class="pi pi-box text-surface-500"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate">{{ item.product?.name }}</p>
                  <p class="text-xs text-surface-500">{{ item.unitPriceHT | currency:'XOF':'symbol':'1.0-0' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <p-button 
                    icon="pi pi-minus" 
                    [text]="true" 
                    size="small"
                    (onClick)="decreaseQuantity(item)">
                  </p-button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <p-button 
                    icon="pi pi-plus" 
                    [text]="true" 
                    size="small"
                    (onClick)="increaseQuantity(item)">
                  </p-button>
                </div>
                <p-button 
                  icon="pi pi-trash" 
                  [text]="true" 
                  size="small" 
                  severity="danger"
                  (onClick)="removeFromCart(item)">
                </p-button>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="p-4 border-t border-surface-200 space-y-3">
            <div class="flex justify-between">
              <span>Sous-total HT:</span>
              <span>{{ cartSubtotal() | currency:'XOF':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex justify-between">
              <span>TVA:</span>
              <span>{{ cartVAT() | currency:'XOF':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total TTC:</span>
              <span>{{ cartTotal() | currency:'XOF':'symbol':'1.0-0' }}</span>
            </div>
            
            <p-button 
              label="Paiement" 
              icon="pi pi-credit-card"
              styleClass="w-full"
              size="large"
              [disabled]="cartItems().length === 0"
              (onClick)="showPaymentDialog.set(true)">
            </p-button>
          </div>
        </div>
      </div>

      <!-- Payment Dialog -->
      <p-dialog 
        header="Paiement" 
        [(visible)]="showPaymentDialog" 
        [modal]="true" 
        [style]="{width: '500px'}"
        [closable]="true">
        <div class="space-y-4">
          <div class="text-center p-4 bg-surface-50 rounded-lg">
            <h3 class="text-2xl font-bold">{{ cartTotal() | currency:'XOF':'symbol':'1.0-0' }}</h3>
            <p class="text-surface-500">Montant à payer</p>
          </div>

          <p-tabView>
            <p-tabPanel header="Espèces">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Montant reçu</label>
                  <p-inputNumber 
                    [(ngModel)]="cashReceived"
                    mode="currency" 
                    currency="XOF"
                    locale="fr-FR"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>
                <div *ngIf="cashReceived() > cartTotal()" class="p-3 bg-green-50 rounded-lg">
                  <p class="text-green-800">
                    <strong>Monnaie à rendre: {{ (cashReceived() - cartTotal()) | currency:'XOF':'symbol':'1.0-0' }}</strong>
                  </p>
                </div>
              </div>
            </p-tabPanel>
            <p-tabPanel header="Carte">
              <div class="text-center py-4">
                <i class="pi pi-credit-card text-4xl text-surface-400 mb-2"></i>
                <p>Paiement par carte bancaire</p>
              </div>
            </p-tabPanel>
            <p-tabPanel header="Mobile Money">
              <div class="text-center py-4">
                <i class="pi pi-mobile text-4xl text-surface-400 mb-2"></i>
                <p>Paiement Mobile Money</p>
              </div>
            </p-tabPanel>
          </p-tabView>

          <div class="flex gap-2 pt-4">
            <p-button 
              label="Annuler" 
              [text]="true" 
              styleClass="flex-1"
              (onClick)="showPaymentDialog.set(false)">
            </p-button>
            <p-button 
              label="Finaliser la vente" 
              styleClass="flex-1"
              (onClick)="completeSale()">
            </p-button>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class PosComponent implements OnInit {
  products = signal<Product[]>([]);
  cartItems = signal<POSCartItem[]>([]);
  searchTerm = signal<string>('');
  showPaymentDialog = signal<boolean>(false);
  cashReceived = signal<number>(0);

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.products();
    
    return this.products().filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.code.toLowerCase().includes(search) ||
      p.barcodes.some(b => b.includes(search))
    );
  });

  cartSubtotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.totalHT, 0)
  );

  cartVAT = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.vatAmount, 0)
  );

  cartTotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.totalTTC, 0)
  );

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadProducts();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  searchProducts() {
    // Search is handled by computed signal
  }

  addToCart(product: Product) {
    const existingItem = this.cartItems().find(item => item.productId === product.id);
    
    if (existingItem) {
      this.increaseQuantity(existingItem);
    } else {
      const newItem: POSCartItem = {
        productId: product.id,
        product: product,
        quantity: 1,
        unitPriceHT: product.salePriceHT,
        discountPercent: 0,
        discountAmount: 0,
        vatRate: product.vatRate,
        vatAmount: product.salePriceHT * product.vatRate / 100,
        totalHT: product.salePriceHT,
        totalTTC: product.salePriceHT * (1 + product.vatRate / 100),
        availableStock: product.stock
      };
      
      this.cartItems.update(items => [...items, newItem]);
    }
  }

  increaseQuantity(item: POSCartItem) {
    if (item.quantity < item.availableStock) {
      this.updateCartItem(item, item.quantity + 1);
    }
  }

  decreaseQuantity(item: POSCartItem) {
    if (item.quantity > 1) {
      this.updateCartItem(item, item.quantity - 1);
    }
  }

  removeFromCart(item: POSCartItem) {
    this.cartItems.update(items => items.filter(i => i.productId !== item.productId));
  }

  completeSale() {
    // Implement sale completion logic
    console.log('Completing sale...', {
      items: this.cartItems(),
      total: this.cartTotal(),
      payment: { method: 'cash', amount: this.cashReceived() }
    });
    
    // Reset cart
    this.cartItems.set([]);
    this.showPaymentDialog.set(false);
    this.cashReceived.set(0);
  }

  private updateCartItem(item: POSCartItem, newQuantity: number) {
    this.cartItems.update(items => 
      items.map(i => {
        if (i.productId === item.productId) {
          const totalHT = i.unitPriceHT * newQuantity;
          const vatAmount = totalHT * i.vatRate / 100;
          return {
            ...i,
            quantity: newQuantity,
            totalHT,
            vatAmount,
            totalTTC: totalHT + vatAmount
          };
        }
        return i;
      })
    );
  }

  private loadProducts() {
    // Use same mock data as product list
    const mockProducts: Product[] = [
      {
        id: '1',
        code: 'PRD-2024-0001',
        name: 'Ciment Portland 50kg',
        slug: 'ciment-portland-50kg',
        categoryId: '1',
        category: 'Ciment et Béton',
        brand: 'Lafarge',
        shortDescription: 'Ciment de haute qualité',
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
        shortDescription: 'Clous galvanisés',
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
      }
    ];

    this.products.set(mockProducts);
  }
}