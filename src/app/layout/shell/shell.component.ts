import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TranslationService } from '../../core/services/translation.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MenubarModule,
    SidebarModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    MenuModule,
    BreadcrumbModule,
    BadgeModule,
    OverlayPanelModule
  ],
  template: `
    <div class="app-shell min-h-screen bg-surface-0">
      <!-- Top Navigation Bar -->
      <div class="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Left side: Menu toggle + Logo + Search -->
          <div class="flex items-center gap-4">
            <p-button 
              icon="pi pi-bars" 
              [text]="true" 
              [rounded]="true"
              (onClick)="toggleSidebar()"
              class="lg:hidden">
            </p-button>
            
            <div class="flex items-center gap-2">
              <i class="pi pi-box text-2xl text-primary-500"></i>
              <span class="text-xl font-bold text-surface-900 dark:text-surface-0">QuincaStock</span>
            </div>

            <!-- Global Search -->
            <div class="hidden md:block">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input 
                  type="text" 
                  pInputText 
                  [(ngModel)]="searchQuery"
                  [placeholder]="t('common.search')"
                  class="w-80"
                  (keyup.enter)="performSearch()">
              </span>
            </div>
          </div>

          <!-- Right side: Notifications + Language + Theme + User -->
          <div class="flex items-center gap-2">
            <!-- Loading indicator -->
            <div *ngIf="isLoading()" class="loading-spinner mr-2"></div>

            <!-- Notifications -->
            <p-button 
              icon="pi pi-bell" 
              [text]="true" 
              [rounded]="true"
              [badge]="'3'"
              badgeClass="p-badge-danger">
            </p-button>

            <!-- Language switcher -->
            <p-button 
              [label]="currentLanguage().toUpperCase()" 
              [text]="true" 
              [rounded]="true"
              (onClick)="toggleLanguage()">
            </p-button>

            <!-- Theme switcher -->
            <p-button 
              [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'" 
              [text]="true" 
              [rounded]="true"
              (onClick)="toggleTheme()">
            </p-button>

            <!-- User menu -->
            <p-button 
              [text]="true" 
              [rounded]="true"
              (onClick)="userMenu.toggle($event)">
              <p-avatar 
                [label]="userInitials()" 
                shape="circle" 
                size="normal"
                styleClass="bg-primary-500 text-white">
              </p-avatar>
            </p-button>

            <p-overlayPanel #userMenu>
              <div class="p-3 min-w-48">
                <div class="mb-3 pb-3 border-b border-surface-200">
                  <div class="font-medium">{{currentUser()?.firstName}} {{currentUser()?.lastName}}</div>
                  <div class="text-sm text-surface-600">{{currentUser()?.email}}</div>
                  <div class="text-xs text-surface-500">{{currentUser()?.role?.displayName}}</div>
                </div>
                <div class="flex flex-col gap-2">
                  <p-button 
                    label="Profile" 
                    icon="pi pi-user" 
                    [text]="true" 
                    class="justify-start">
                  </p-button>
                  <p-button 
                    label="Settings" 
                    icon="pi pi-cog" 
                    [text]="true" 
                    class="justify-start"
                    (onClick)="navigateTo('/settings')">
                  </p-button>
                  <p-button 
                    [label]="t('auth.logout')" 
                    icon="pi pi-sign-out" 
                    [text]="true" 
                    class="justify-start"
                    (onClick)="logout()">
                  </p-button>
                </div>
              </div>
            </p-overlayPanel>
          </div>
        </div>
      </div>

      <div class="flex">
        <!-- Sidebar -->
        <p-sidebar 
          [(visible)]="sidebarVisible" 
          position="left"
          [modal]="false"
          [showCloseIcon]="false"
          styleClass="w-80 lg:w-64"
          [class.lg:block]="!sidebarVisible"
          [class.lg:relative]="true"
          [class.lg:transform-none]="true">
          
          <div class="h-full flex flex-col">
            <!-- Navigation Menu -->
            <nav class="flex-1 p-4">
              <ul class="space-y-1">
                <li *ngFor="let item of menuItems()">
                  <!-- Menu item with submenu -->
                  <div *ngIf="item.items; else simpleMenuItem">
                    <button 
                      (click)="toggleSubmenu(item)"
                      class="w-full flex items-center gap-3 px-3 py-2 rounded-l-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                      <i [class]="item.icon" class="text-lg"></i>
                      <span class="flex-1 text-left">{{item.label}}</span>
                      <i [class]="item.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="text-sm"></i>
                    </button>
                    <!-- Submenu -->
                    <ul *ngIf="item.expanded" class="ml-6 mt-1 space-y-1">
                      <li *ngFor="let subItem of item.items">
                        <a 
                          [routerLink]="subItem.routerLink"
                          routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500"
                          class="flex items-center gap-3 px-3 py-2 rounded-l-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                          <i [class]="subItem.icon" class="text-base"></i>
                          <span>{{subItem.label}}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <!-- Simple menu item -->
                  <ng-template #simpleMenuItem>
                    <a 
                      [routerLink]="item.routerLink"
                      routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500"
                      class="flex items-center gap-3 px-3 py-2 rounded-l-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                      <i [class]="item.icon" class="text-lg"></i>
                      <span>{{item.label}}</span>
                      <p-badge 
                        *ngIf="item.badge" 
                        [value]="item.badge" 
                        severity="danger" 
                        class="ml-auto">
                      </p-badge>
                    </a>
                  </ng-template>
                </li>
              </ul>
            </nav>

            <!-- Sidebar Footer -->
            <div class="p-4 border-t border-surface-200 dark:border-surface-700">
              <div class="text-xs text-surface-500 text-center">
                QuincaStock v1.0.0<br>
                © 2025 - Gestion de Stock
              </div>
            </div>
          </div>
        </p-sidebar>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-h-screen">
          <!-- Breadcrumb -->
          <div class="bg-surface-50 dark:bg-surface-800 px-4 py-2 border-b border-surface-200 dark:border-surface-700">
            <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem"></p-breadcrumb>
          </div>

          <!-- Page Content -->
          <main class="flex-1 p-4 bg-surface-50 dark:bg-surface-900">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-sidebar {
      @apply lg:relative lg:transform-none lg:transition-none;
    }
    
    :host ::ng-deep .p-sidebar-mask {
      @apply lg:hidden;
    }

    .loading-spinner {
      @apply inline-block w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin;
    }
  `]
})
export class ShellComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  // Signals
  sidebarVisible = signal<boolean>(false);
  searchQuery = signal<string>('');
  expandedMenuItems = signal<Set<string>>(new Set());

  // Computed signals
  currentUser = computed(() => this.authService.user());
  userInitials = computed(() => {
    const user = this.currentUser();
    if (user) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  });
  
  isDarkMode = computed(() => this.themeService.isDarkMode());
  currentLanguage = computed(() => this.translationService.language());
  isLoading = computed(() => this.loadingService.isLoading());

  // Menu items
 menuItems = computed(() => [
  {
    label: this.t('navigation.dashboard'),
    icon: 'pi pi-home',
    routerLink: '/dashboard',
      badge: null
  },
  {
    label: this.t('navigation.products'),
    icon: 'pi pi-box',
    routerLink: '/products',
    badge: '0',
    badgeStyleClass: 'bg-gray-500 text-white'
  },
  {
    label: this.t('navigation.categories'),
    icon: 'pi pi-tags',
    routerLink: '/categories',
    badge: '0',
    badgeStyleClass: 'bg-gray-500 text-white'
  },
  {
    label: this.t('navigation.suppliers'),
    icon: 'pi pi-truck',
    routerLink: '/suppliers',
    badge: '0',
    badgeStyleClass: 'bg-gray-500 text-white'
  },
  {
    label: this.t('navigation.customers'),
    icon: 'pi pi-users',
    routerLink: '/customers',
    badge: '0',
    badgeStyleClass: 'bg-gray-500 text-white'
  },
  {
    label: this.t('navigation.purchases'),
    icon: 'pi pi-shopping-cart',
    routerLink: '/purchases',
    badge: '0',
    badgeStyleClass: 'bg-gray-500 text-white'
  },
  {
    label: this.t('navigation.sales'),
    icon: 'pi pi-dollar',
    routerLink: '/sales',
      expanded: false,
      items: [
        {
          label: this.t('navigation.products'),
          icon: 'pi pi-list',
          routerLink: '/products'
        },
        {
          label: this.t('navigation.categories'),
          icon: 'pi pi-tags',
          routerLink: '/categories'
        },
        {
          label: this.t('navigation.units'),
          icon: 'pi pi-calculator',
          routerLink: '/units'
        },
        {
          label: this.t('navigation.variants'),
          icon: 'pi pi-clone',
          routerLink: '/variants'
        }
      ]
  },
  {
    label: this.t('navigation.pos'),
    icon: 'pi pi-warehouse',
    routerLink: '/inventory',
    badge: '0',
      badge: null
  },
  {
    label: this.t('navigation.warehouses'),
    icon: 'pi pi-building',
    routerLink: '/warehouses',
    badge: '0',
      badge: null
  },
  {
    label: this.t('navigation.returns'),
    icon: 'pi pi-replay',
    routerLink: '/returns',
    badge: '0',
      badge: null
  },
  {
    label: this.t('navigation.reports'),
    icon: 'pi pi-chart-bar',
    routerLink: '/reports',
      expanded: false,
      items: [
        {
          label: this.t('navigation.sales'),
          icon: 'pi pi-list',
          routerLink: '/sales'
        },
        {
          label: this.t('navigation.pos'),
          icon: 'pi pi-calculator',
          routerLink: '/sales/pos'
        }
      ]
  },
  {
    label: this.t('navigation.settings'),
    icon: 'pi pi-cog',
    routerLink: '/settings',
      expanded: false,
      items: [
        {
          label: this.t('navigation.movements'),
          icon: 'pi pi-arrow-right-arrow-left',
          routerLink: '/inventory/movements'
        },
        {
          label: this.t('navigation.transfers'),
          icon: 'pi pi-send',
          routerLink: '/inventory/transfers'
        },
        {
          label: this.t('navigation.adjustments'),
          icon: 'pi pi-wrench',
          routerLink: '/inventory/adjustments'
        },
        {
          label: this.t('navigation.counts'),
          icon: 'pi pi-list-check',
          routerLink: '/inventory/counts'
        }
      ]
  },
  {
    label: this.t('navigation.damages'),
    icon: 'pi pi-exclamation-triangle',
    routerLink: '/damages',
    badge: null
  },
  {
    label: this.t('navigation.notifications'),
    icon: 'pi pi-bell',
    routerLink: '/notifications',
    badge: '3'
  }
 ]);

  // Breadcrumb
  breadcrumbItems: MenuItem[] = [];
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit() {
    this.updateBreadcrumb();
    
    // Listen to route changes to update breadcrumb
    this.router.events.subscribe(() => {
      this.updateBreadcrumb();
    });
  }

  toggleSidebar() {
    this.sidebarVisible.update(visible => !visible);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleLanguage() {
    const currentLang = this.currentLanguage();
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    this.translationService.setLanguage(newLang);
  }

  performSearch() {
    const query = this.searchQuery();
    if (query.trim()) {
      // Implement search functionality
      console.log('Searching for:', query);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
  }

  toggleSubmenu(item: any) {
    item.expanded = !item.expanded;
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  private updateBreadcrumb() {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);
    
    this.breadcrumbItems = segments.map((segment, index) => {
      const routerLink = '/' + segments.slice(0, index + 1).join('/');
      return {
        label: this.getBreadcrumbLabel(segment),
        routerLink: routerLink
      };
    });
  }

  private getBreadcrumbLabel(segment: string): string {
    const labelMap: Record<string, string> = {
      'dashboard': this.t('navigation.dashboard'),
      'products': this.t('navigation.products'),
      'categories': this.t('navigation.categories'),
      'units': this.t('navigation.units'),
      'variants': this.t('navigation.variants'),
      'suppliers': this.t('navigation.suppliers'),
      'customers': this.t('navigation.customers'),
      'purchases': this.t('navigation.purchases'),
      'sales': this.t('navigation.sales'),
      'pos': this.t('navigation.pos'),
      'inventory': this.t('navigation.inventory'),
      'movements': this.t('navigation.movements'),
      'transfers': this.t('navigation.transfers'),
      'adjustments': this.t('navigation.adjustments'),
      'counts': this.t('navigation.counts'),
      'warehouses': this.t('navigation.warehouses'),
      'returns': this.t('navigation.returns'),
      'damages': this.t('navigation.damages'),
      'reports': this.t('navigation.reports'),
      'settings': this.t('navigation.settings'),
      'notifications': this.t('navigation.notifications')
    };

    return labelMap[segment] || segment;
  }
}