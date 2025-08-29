import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

import { TranslationService } from '../../../core/services/translation.service';
import { Warehouse } from '../../../core/models/stock.model';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.warehouses') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos entrepôts et points de stockage
          </p>
        </div>
        <p-button 
          label="Nouvel entrepôt" 
          icon="pi pi-plus">
        </p-button>
      </div>

      <!-- Warehouses Table -->
      <p-card>
        <p-table 
          [value]="warehouses()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Responsable</th>
              <th>Défaut</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-warehouse>
            <tr>
              <td>
                <span class="font-mono text-sm">{{ warehouse.code }}</span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-building text-primary-500"></i>
                  <span class="font-medium">{{ warehouse.name }}</span>
                </div>
              </td>
              <td>{{ warehouse.address || '-' }}</td>
              <td>{{ warehouse.manager || '-' }}</td>
              <td>
                <p-tag 
                  *ngIf="warehouse.isDefault"
                  value="Défaut" 
                  severity="success">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="warehouse.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="warehouse.isActive ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" size="small" pTooltip="Voir"></p-button>
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
export class WarehouseListComponent implements OnInit {
  warehouses = signal<Warehouse[]>([]);

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  private loadWarehouses() {
    const mockWarehouses: Warehouse[] = [
      {
        id: '1',
        code: 'WH-001',
        name: 'Entrepôt Principal',
        address: 'Zone Industrielle, Cotonou',
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'WH-002',
        name: 'Magasin Showroom',
        address: 'Avenue Steinmetz, Cotonou',
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.warehouses.set(mockWarehouses);
  }
}