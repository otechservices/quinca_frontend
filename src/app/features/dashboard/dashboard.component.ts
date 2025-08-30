import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

import { TranslationService } from '../../core/services/translation.service';

interface DashboardKPI {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  stock: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule,
    ProgressBarModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('dashboard.title') }}
        </h1>
        <div class="flex space-x-2">
          <button pButton label="Exporter" icon="fas fa-download" class="p-button-outlined"></button>
          <button pButton label="Actualiser" icon="fas fa-sync-alt" (click)="refreshData()"></button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let kpi of kpis()" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div [class]="'w-8 h-8 rounded-md flex items-center justify-center ' + kpi.color">
                <i [class]="kpi.icon + ' text-white'"></i>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {{ kpi.title }}
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ kpi.value }}
                  </div>
                  <div [class]="'ml-2 flex items-baseline text-sm font-semibold ' + (kpi.change >= 0 ? 'text-green-600' : 'text-red-600')">
                    <i [class]="kpi.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                    <span class="ml-1">{{ Math.abs(kpi.change) }}%</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Chart -->
        <p-card header="Évolution des ventes (30 derniers jours)">
          <p-chart type="line" [data]="salesChartData()" [options]="chartOptions" height="300px"></p-chart>
        </p-card>

        <!-- Category Distribution -->
        <p-card header="Répartition par catégorie">
          <p-chart type="doughnut" [data]="categoryChartData()" [options]="doughnutOptions" height="300px"></p-chart>
        </p-card>
      </div>

      <!-- Tables Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Products -->
        <p-card header="Top 10 Produits">
          <p-table [value]="topProducts()" [paginator]="false" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Produit</th>
                <th>Ventes</th>
                <th>CA</th>
                <th>Stock</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-product>
              <tr>
                <td>{{ product.name }}</td>
                <td>{{ product.sales }}</td>
                <td>{{ product.revenue | currency:'XOF':'symbol':'1.0-0' }}</td>
                <td>
                  <p-tag 
                    [value]="product.stock.toString()" 
                    [severity]="product.stock < 10 ? 'danger' : product.stock < 50 ? 'warning' : 'success'"
                  ></p-tag>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <!-- Low Stock Alerts -->
        <p-card header="Alertes Stock Faible">
          <div class="space-y-3">
            <div *ngFor="let alert of lowStockAlerts()" class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ alert.product }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Stock: {{ alert.stock }} / Seuil: {{ alert.threshold }}</p>
                </div>
              </div>
              <button pButton icon="fas fa-shopping-cart" class="p-button-sm p-button-outlined" 
                      pTooltip="Commander"></button>
            </div>
            <div *ngIf="lowStockAlerts().length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
              <i class="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
              <p>Aucune alerte de stock</p>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Recent Activities -->
      <p-card header="Activités récentes">
        <div class="space-y-4">
          <div *ngFor="let activity of recentActivities()" class="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            <div [class]="'w-10 h-10 rounded-full flex items-center justify-center ' + activity.color">
              <i [class]="activity.icon + ' text-white'"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ activity.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ activity.description }}</p>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ activity.time }}
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  kpis = signal<DashboardKPI[]>([]);
  topProducts = signal<TopProduct[]>([]);
  lowStockAlerts = signal<any[]>([]);
  recentActivities = signal<any[]>([]);
  salesChartData = signal<any>({});
  categoryChartData = signal<any>({});
 Math = Math;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  refreshData() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Mock data - replace with real API calls
    this.kpis.set([
      {
        title: this.t('dashboard.totalStock'),
        value: '2,450,000 XOF',
        change: 12.5,
        icon: 'fas fa-database',
        color: 'bg-blue-500'
      },
      {
        title: this.t('dashboard.dailySales'),
        value: '185,000 XOF',
        change: 8.2,
        icon: 'fas fa-money-bill-wave',
        color: 'bg-green-500'
      },
      {
        title: this.t('dashboard.grossMargin'),
        value: '32.5%',
        change: -2.1,
        icon: 'fas fa-chart-line',
        color: 'bg-purple-500'
      },
      {
        title: this.t('dashboard.lowStock'),
        value: '12',
        change: -15.3,
        icon: 'fas fa-exclamation-triangle',
        color: 'bg-red-500'
      }
    ]);

    this.topProducts.set([
      { name: 'Ciment Portland 50kg', sales: 45, revenue: 675000, stock: 120 },
      { name: 'Clous 10cm (1kg)', sales: 38, revenue: 190000, stock: 85 },
      { name: 'Peinture Blanche 5L', sales: 32, revenue: 480000, stock: 25 },
      { name: 'Vis Inox 6x40 (100pcs)', sales: 28, revenue: 140000, stock: 5 },
      { name: 'Robinet Cuisine', sales: 25, revenue: 375000, stock: 15 }
    ]);

    this.lowStockAlerts.set([
      { product: 'Vis Inox 6x40 (100pcs)', stock: 5, threshold: 20 },
      { product: 'Peinture Rouge 5L', stock: 8, threshold: 15 },
      { product: 'Tuyau PVC 32mm', stock: 12, threshold: 25 }
    ]);

    this.recentActivities.set([
      {
        title: 'Nouvelle vente',
        description: 'Vente #SO-2024-0156 - 125,000 XOF',
        time: 'Il y a 5 min',
        icon: 'fas fa-shopping-cart',
        color: 'bg-green-500'
      },
      {
        title: 'Stock faible',
        description: 'Vis Inox 6x40 - Stock critique',
        time: 'Il y a 15 min',
        icon: 'fas fa-exclamation-triangle',
        color: 'bg-red-500'
      },
      {
        title: 'Réception marchandise',
        description: 'Bon de réception #GR-2024-0089',
        time: 'Il y a 1h',
        icon: 'fas fa-truck',
        color: 'bg-blue-500'
      }
    ]);

    // Sales chart data
    this.salesChartData.set({
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      datasets: [
        {
          label: 'Ventes (XOF)',
          data: [1200000, 1350000, 1180000, 1450000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    });

    // Category chart data
    this.categoryChartData.set({
      labels: ['Ciment', 'Quincaillerie', 'Peinture', 'Plomberie', 'Électricité'],
      datasets: [
        {
          data: [35, 25, 20, 12, 8],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6'
          ]
        }
      ]
    });
  }
}