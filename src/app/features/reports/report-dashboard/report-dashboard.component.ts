import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';

import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ChartModule,
    CalendarModule,
    DropdownModule,
    TabViewModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.reports') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Analyses et rapports de gestion
          </p>
        </div>
        <p-button 
          label="Exporter PDF" 
          icon="pi pi-file-pdf">
        </p-button>
      </div>

      <!-- Report Filters -->
      <p-card header="Filtres">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Période</label>
            <p-dropdown 
              [(ngModel)]="selectedPeriod"
              [options]="periodOptions"
              placeholder="Sélectionner"
              optionLabel="label"
              optionValue="value"
              class="w-full">
            </p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Date début</label>
            <p-calendar 
              [(ngModel)]="dateFrom"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              class="w-full">
            </p-calendar>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Date fin</label>
            <p-calendar 
              [(ngModel)]="dateTo"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              class="w-full">
            </p-calendar>
          </div>
          <div class="flex items-end">
            <p-button 
              label="Générer" 
              icon="pi pi-refresh"
              class="w-full">
            </p-button>
          </div>
        </div>
      </p-card>

      <!-- Report Tabs -->
      <p-tabView>
        <!-- Sales Report -->
        <p-tabPanel header="Rapport des Ventes">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <p-card header="Évolution des ventes">
              <p-chart type="line" [data]="salesChartData()" height="300px"></p-chart>
            </p-card>
            <p-card header="Ventes par canal">
              <p-chart type="pie" [data]="channelChartData()" height="300px"></p-chart>
            </p-card>
          </div>
        </p-tabPanel>

        <!-- Inventory Report -->
        <p-tabPanel header="Rapport d'Inventaire">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <p-card header="Valeur du stock">
              <p-chart type="bar" [data]="stockValueData()" height="300px"></p-chart>
            </p-card>
            <p-card header="Rotation des stocks">
              <p-chart type="doughnut" [data]="stockRotationData()" height="300px"></p-chart>
            </p-card>
          </div>
        </p-tabPanel>

        <!-- Financial Report -->
        <p-tabPanel header="Rapport Financier">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <p-card header="Chiffre d'affaires">
              <p-chart type="bar" [data]="revenueData()" height="300px"></p-chart>
            </p-card>
            <p-card header="Marges par catégorie">
              <p-chart type="radar" [data]="marginData()" height="300px"></p-chart>
            </p-card>
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>
  `
})
export class ReportDashboardComponent implements OnInit {
  selectedPeriod = signal<string>('month');
  dateFrom = signal<Date>(new Date());
  dateTo = signal<Date>(new Date());
  salesChartData = signal<any>({});
  channelChartData = signal<any>({});
  stockValueData = signal<any>({});
  stockRotationData = signal<any>({});
  revenueData = signal<any>({});
  marginData = signal<any>({});

  periodOptions = [
    { label: 'Aujourd\'hui', value: 'today' },
    { label: 'Cette semaine', value: 'week' },
    { label: 'Ce mois', value: 'month' },
    { label: 'Ce trimestre', value: 'quarter' },
    { label: 'Cette année', value: 'year' },
    { label: 'Personnalisé', value: 'custom' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadReportData();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  private loadReportData() {
    // Mock chart data
    this.salesChartData.set({
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Ventes (XOF)',
        data: [1200000, 1350000, 1180000, 1450000, 1320000, 1580000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
    });

    this.channelChartData.set({
      labels: ['POS', 'En ligne', 'Téléphone', 'Comptoir'],
      datasets: [{
        data: [65, 20, 10, 5],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      }]
    });
  }
}