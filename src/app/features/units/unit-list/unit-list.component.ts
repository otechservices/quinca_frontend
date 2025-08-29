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
import { Unit } from '../../../core/models/product.model';

@Component({
  selector: 'app-unit-list',
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
            {{ t('navigation.units') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les unités de mesure
          </p>
        </div>
        <p-button 
          label="Nouvelle unité" 
          icon="pi pi-plus">
        </p-button>
      </div>

      <!-- Units Table -->
      <p-card>
        <p-table 
          [value]="units()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Nom</th>
              <th>Symbole</th>
              <th>Conversion</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-unit>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-calculator text-primary-500"></i>
                  <span class="font-medium">{{ unit.name }}</span>
                </div>
              </td>
              <td>
                <code class="bg-surface-100 px-2 py-1 rounded">{{ unit.symbol }}</code>
              </td>
              <td>
                <span class="text-sm">1 base = {{ unit.conversionToBase }} {{ unit.symbol }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="unit.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="unit.isActive ? 'success' : 'danger'">
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
export class UnitListComponent implements OnInit {
  units = signal<Unit[]>([]);

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadUnits();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  private loadUnits() {
    const mockUnits: Unit[] = [
      {
        id: '1',
        name: 'Pièce',
        symbol: 'pcs',
        conversionToBase: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Boîte',
        symbol: 'box',
        conversionToBase: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Kilogramme',
        symbol: 'kg',
        conversionToBase: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Litre',
        symbol: 'L',
        conversionToBase: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.units.set(mockUnits);
  }
}