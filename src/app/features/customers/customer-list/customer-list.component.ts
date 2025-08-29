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

import { TranslationService } from '../../../core/services/translation.service';
import { Customer, CustomerType } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    DropdownModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.customers') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gérez votre base clients
          </p>
        </div>
        <p-button 
          label="Nouveau client" 
          icon="pi pi-plus">
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
              placeholder="Rechercher..."
              class="w-full">
          </span>
          <p-dropdown 
            [(ngModel)]="selectedType"
            [options]="typeOptions"
            placeholder="Type de client"
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

      <!-- Customers Table -->
      <p-card>
        <p-table 
          [value]="customers()" 
          [paginator]="true" 
          [rows]="20"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th>Code</th>
              <th>Client</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Solde</th>
              <th>Statut</th>
              <th style="width: 8rem">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-customer>
            <tr>
              <td>
                <span class="font-mono text-sm">{{ customer.code }}</span>
              </td>
              <td>
                <div>
                  <div class="font-medium">
                    {{ customer.type === 'individual' ? 
                        (customer.firstName + ' ' + customer.lastName) : 
                        customer.companyName }}
                  </div>
                  <div class="text-sm text-gray-500" *ngIf="customer.contactPerson">
                    {{ customer.contactPerson }}
                  </div>
                </div>
              </td>
              <td>
                <p-tag 
                  [value]="customer.type === 'individual' ? 'Particulier' : 'Entreprise'" 
                  [severity]="customer.type === 'individual' ? 'info' : 'warning'">
                </p-tag>
              </td>
              <td>
                <div class="text-sm">
                  <div>{{ customer.phone || '-' }}</div>
                  <div class="text-gray-500">{{ customer.email || '-' }}</div>
                </div>
              </td>
              <td>
                <div class="text-right">
                  <span [class]="customer.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ customer.currentBalance | currency:'XOF':'symbol':'1.0-0' }}
                  </span>
                </div>
              </td>
              <td>
                <p-tag 
                  [value]="customer.isActive ? 'Actif' : 'Inactif'" 
                  [severity]="customer.isActive ? 'success' : 'danger'">
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
export class CustomerListComponent implements OnInit {
  customers = signal<Customer[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedStatus = signal<string>('');

  typeOptions = [
    { label: 'Particulier', value: 'individual' },
    { label: 'Entreprise', value: 'company' }
  ];

  statusOptions = [
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  private loadCustomers() {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        code: 'CUS-2024-0001',
        type: CustomerType.COMPANY,
        companyName: 'BTP Construction SARL',
        contactPerson: 'Alain Dossou',
        phone: '+229 97 12 34 56',
        email: 'contact@btpconstruction.bj',
        currentBalance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'CUS-2024-0002',
        type: CustomerType.INDIVIDUAL,
        firstName: 'Marie',
        lastName: 'Adjovi',
        phone: '+229 96 78 90 12',
        email: 'marie.adjovi@email.com',
        currentBalance: -25000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.customers.set(mockCustomers);
  }
}