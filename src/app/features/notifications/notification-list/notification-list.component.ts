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
import { BadgeModule } from 'primeng/badge';

import { TranslationService } from '../../../core/services/translation.service';

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRY_SOON = 'expiry_soon',
  SALE_COMPLETED = 'sale_completed',
  PURCHASE_RECEIVED = 'purchase_received',
  SYSTEM_ALERT = 'system_alert'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Component({
  selector: 'app-notification-list',
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
    BadgeModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.notifications') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Centre de notifications et alertes
          </p>
        </div>
        <div class="flex gap-2">
          <p-button 
            label="Marquer tout comme lu" 
            icon="pi pi-check"
            [outlined]="true"
            (onClick)="markAllAsRead()">
          </p-button>
          <p-button 
            label="Paramètres" 
            icon="pi pi-cog"
            [outlined]="true">
          </p-button>
        </div>
      </div>

      <!-- Notification Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <i class="pi pi-exclamation-triangle text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Critiques</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ criticalCount() }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <i class="pi pi-exclamation-circle text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Importantes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ highCount() }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <i class="pi pi-info-circle text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Non lues</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ unreadCount() }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <i class="pi pi-check-circle text-white"></i>
              </div>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total aujourd'hui</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ todayCount() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <p-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            placeholder="Type"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full">
          </p-dropdown>
          <p-dropdown 
            [(ngModel)]="selectedPriority"
            [options]="priorityOptions"
            placeholder="Priorité"
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

      <!-- Notifications List -->
      <p-card>
        <div class="space-y-3">
          <div 
            *ngFor="let notification of notifications()" 
            class="flex items-start gap-4 p-4 border border-surface-200 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            [class.bg-surface-50]="!notification.isRead"
            [class.dark:bg-surface-800]="!notification.isRead">
            
            <!-- Icon -->
            <div [class]="'w-10 h-10 rounded-full flex items-center justify-center ' + getNotificationColor(notification.type, notification.priority)">
              <i [class]="getNotificationIcon(notification.type) + ' text-white'"></i>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ notification.title }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center gap-2 mt-2">
                    <p-tag 
                      [value]="getTypeLabel(notification.type)" 
                      severity="info"
                      class="text-xs">
                    </p-tag>
                    <p-tag 
                      [value]="getPriorityLabel(notification.priority)" 
                      [severity]="getPrioritySeverity(notification.priority)"
                      class="text-xs">
                    </p-tag>
                    <span class="text-xs text-gray-500">{{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-2 ml-4">
                  <p-badge 
                    *ngIf="!notification.isRead"
                    value="Nouveau"
                    severity="danger">
                  </p-badge>
                  <p-button 
                    *ngIf="!notification.isRead"
                    icon="pi pi-check" 
                    [text]="true" 
                    size="small"
                    pTooltip="Marquer comme lu"
                    (onClick)="markAsRead(notification)">
                  </p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    [text]="true" 
                    size="small"
                    severity="danger"
                    pTooltip="Supprimer"
                    (onClick)="deleteNotification(notification)">
                  </p-button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="notifications().length === 0" class="text-center py-8 text-gray-500">
            <i class="pi pi-bell-slash text-4xl mb-4"></i>
            <p>Aucune notification</p>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class NotificationListComponent implements OnInit {
  notifications = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedPriority = signal<string>('');
  selectedStatus = signal<string>('');

  // Computed counts
  criticalCount = signal<number>(0);
  highCount = signal<number>(0);
  unreadCount = signal<number>(0);
  todayCount = signal<number>(0);

  typeOptions = [
    { label: 'Stock faible', value: 'low_stock' },
    { label: 'Rupture de stock', value: 'out_of_stock' },
    { label: 'Expiration proche', value: 'expiry_soon' },
    { label: 'Vente terminée', value: 'sale_completed' },
    { label: 'Réception achat', value: 'purchase_received' },
    { label: 'Alerte système', value: 'system_alert' }
  ];

  priorityOptions = [
    { label: 'Faible', value: 'low' },
    { label: 'Moyenne', value: 'medium' },
    { label: 'Élevée', value: 'high' },
    { label: 'Critique', value: 'critical' }
  ];

  statusOptions = [
    { label: 'Non lue', value: 'unread' },
    { label: 'Lue', value: 'read' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  getTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      [NotificationType.LOW_STOCK]: 'Stock faible',
      [NotificationType.OUT_OF_STOCK]: 'Rupture de stock',
      [NotificationType.EXPIRY_SOON]: 'Expiration proche',
      [NotificationType.SALE_COMPLETED]: 'Vente terminée',
      [NotificationType.PURCHASE_RECEIVED]: 'Réception achat',
      [NotificationType.SYSTEM_ALERT]: 'Alerte système'
    };
    return labels[type];
  }

  getPriorityLabel(priority: NotificationPriority): string {
    const labels: Record<NotificationPriority, string> = {
      [NotificationPriority.LOW]: 'Faible',
      [NotificationPriority.MEDIUM]: 'Moyenne',
      [NotificationPriority.HIGH]: 'Élevée',
      [NotificationPriority.CRITICAL]: 'Critique'
    };
    return labels[priority];
  }

  getPrioritySeverity(priority: NotificationPriority): 'success' | 'info' | 'warning' | 'danger' {
    switch (priority) {
      case NotificationPriority.LOW:
        return 'success';
      case NotificationPriority.MEDIUM:
        return 'info';
      case NotificationPriority.HIGH:
        return 'warning';
      case NotificationPriority.CRITICAL:
        return 'danger';
      default:
        return 'info';
    }
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.LOW_STOCK]: 'pi pi-exclamation-triangle',
      [NotificationType.OUT_OF_STOCK]: 'pi pi-times-circle',
      [NotificationType.EXPIRY_SOON]: 'pi pi-clock',
      [NotificationType.SALE_COMPLETED]: 'pi pi-shopping-cart',
      [NotificationType.PURCHASE_RECEIVED]: 'pi pi-truck',
      [NotificationType.SYSTEM_ALERT]: 'pi pi-cog'
    };
    return icons[type];
  }

  getNotificationColor(type: NotificationType, priority: NotificationPriority): string {
    if (priority === NotificationPriority.CRITICAL) return 'bg-red-500';
    if (priority === NotificationPriority.HIGH) return 'bg-orange-500';
    
    switch (type) {
      case NotificationType.LOW_STOCK:
      case NotificationType.OUT_OF_STOCK:
        return 'bg-red-500';
      case NotificationType.EXPIRY_SOON:
        return 'bg-orange-500';
      case NotificationType.SALE_COMPLETED:
        return 'bg-green-500';
      case NotificationType.PURCHASE_RECEIVED:
        return 'bg-blue-500';
      case NotificationType.SYSTEM_ALERT:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  }

  markAsRead(notification: any) {
    notification.isRead = true;
    this.updateCounts();
  }

  markAllAsRead() {
    this.notifications.update(notifications => 
      notifications.map(n => ({ ...n, isRead: true }))
    );
    this.updateCounts();
  }

  deleteNotification(notification: any) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== notification.id)
    );
    this.updateCounts();
  }

  private loadNotifications() {
    const mockNotifications = [
      {
        id: '1',
        type: NotificationType.LOW_STOCK,
        priority: NotificationPriority.HIGH,
        title: 'Stock faible détecté',
        message: 'Le produit "Vis Inox 6x40 (100pcs)" a un stock de 5 unités (seuil: 20)',
        isRead: false,
        createdAt: new Date()
      },
      {
        id: '2',
        type: NotificationType.SALE_COMPLETED,
        priority: NotificationPriority.MEDIUM,
        title: 'Nouvelle vente enregistrée',
        message: 'Vente SO-2024-0156 terminée - Montant: 125,000 XOF',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000)
      },
      {
        id: '3',
        type: NotificationType.PURCHASE_RECEIVED,
        priority: NotificationPriority.MEDIUM,
        title: 'Réception de marchandise',
        message: 'Bon de réception GR-2024-0089 traité - 15 articles reçus',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: '4',
        type: NotificationType.EXPIRY_SOON,
        priority: NotificationPriority.CRITICAL,
        title: 'Produits bientôt expirés',
        message: '3 lots de "Colle Carrelage 25kg" expirent dans 7 jours',
        isRead: false,
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        id: '5',
        type: NotificationType.SYSTEM_ALERT,
        priority: NotificationPriority.LOW,
        title: 'Sauvegarde automatique',
        message: 'Sauvegarde quotidienne effectuée avec succès',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000)
      }
    ];

    this.notifications.set(mockNotifications);
    this.updateCounts();
  }

  private updateCounts() {
    const notifications = this.notifications();
    this.criticalCount.set(notifications.filter(n => n.priority === NotificationPriority.CRITICAL && !n.isRead).length);
    this.highCount.set(notifications.filter(n => n.priority === NotificationPriority.HIGH && !n.isRead).length);
    this.unreadCount.set(notifications.filter(n => !n.isRead).length);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayCount.set(notifications.filter(n => new Date(n.createdAt) >= today).length);
  }
}