import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

import { TranslationService } from '../../../core/services/translation.service';
import { Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToolbarModule,
    TreeModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.categories') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Organisez vos produits par catégories
          </p>
        </div>
        <p-button 
          label="Nouvelle catégorie" 
          icon="pi pi-plus">
        </p-button>
      </div>

      <!-- Categories Tree -->
      <p-card>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tree View -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Arborescence des catégories</h3>
            <p-tree 
              [value]="categoryTree()" 
              selectionMode="single"
              [(selection)]="selectedCategory"
              class="w-full">
            </p-tree>
          </div>

          <!-- Category Details -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Détails de la catégorie</h3>
            <div *ngIf="selectedCategory; else noCategorySelected" class="space-y-4">
              <div class="p-4 border border-surface-200 rounded-lg">
                <h4 class="font-medium text-lg">{{ selectedCategory.label }}</h4>
                <p class="text-sm text-surface-600 mt-1">{{ selectedCategory.data?.description || 'Aucune description' }}</p>
                <div class="flex gap-2 mt-3">
                  <p-button label="Modifier" icon="pi pi-pencil" size="small"></p-button>
                  <p-button label="Supprimer" icon="pi pi-trash" severity="danger" size="small"></p-button>
                </div>
              </div>
            </div>
            <ng-template #noCategorySelected>
              <div class="text-center py-8 text-surface-500">
                <i class="pi pi-folder text-4xl mb-4"></i>
                <p>Sélectionnez une catégorie pour voir les détails</p>
              </div>
            </ng-template>
          </div>
        </div>
      </p-card>

      <!-- Categories Table -->
      <p-card header="Liste des catégories">
        <p-table 
          [value]="flatCategories()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Nom</th>
              <th>Parent</th>
              <th>Produits</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-category>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-folder text-primary-500"></i>
                  <span class="font-medium">{{ category.name }}</span>
                </div>
              </td>
              <td>{{ category.parent?.name || '-' }}</td>
              <td>
                <p-tag [value]="category.productCount?.toString() || '0'" severity="info"></p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="category.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="category.isActive ? 'success' : 'danger'">
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
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  selectedCategory = signal<TreeNode | null>(null);

  categoryTree = computed(() => this.buildCategoryTree(this.categories()));
  flatCategories = computed(() => this.categories());

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadCategories();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  private loadCategories() {
    // Mock data
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Ciment et Béton',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Quincaillerie',
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Peinture',
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Plomberie',
        sortOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.categories.set(mockCategories);
  }

  private buildCategoryTree(categories: Category[]): TreeNode[] {
    return categories.map(cat => ({
      key: cat.id,
      label: cat.name,
      data: cat,
      icon: 'pi pi-folder',
      children: []
    }));
  }
}