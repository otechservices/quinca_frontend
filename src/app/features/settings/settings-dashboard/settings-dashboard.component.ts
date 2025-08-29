import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-settings-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    TabViewModule,
    TableModule,
    TagModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('navigation.settings') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Configuration de l'application
          </p>
        </div>
        <p-button 
          label="Sauvegarder" 
          icon="pi pi-save">
        </p-button>
      </div>

      <!-- Settings Tabs -->
      <p-tabView>
        <!-- General Settings -->
        <p-tabPanel header="Général">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <p-card header="Informations de l'entreprise">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nom de l'entreprise</label>
                  <input type="text" pInputText [(ngModel)]="companyName" class="w-full">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Adresse</label>
                  <input type="text" pInputText [(ngModel)]="companyAddress" class="w-full">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Téléphone</label>
                  <input type="text" pInputText [(ngModel)]="companyPhone" class="w-full">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Email</label>
                  <input type="email" pInputText [(ngModel)]="companyEmail" class="w-full">
                </div>
              </div>
            </p-card>

            <p-card header="Préférences">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Langue</label>
                  <p-dropdown 
                    [(ngModel)]="selectedLanguage"
                    [options]="languageOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    (onChange)="changeLanguage()">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Devise</label>
                  <p-dropdown 
                    [(ngModel)]="selectedCurrency"
                    [options]="currencyOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium">Mode sombre</label>
                  <p-inputSwitch 
                    [(ngModel)]="darkMode"
                    (onChange)="toggleTheme()">
                  </p-inputSwitch>
                </div>
              </div>
            </p-card>
          </div>
        </p-tabPanel>

        <!-- Users & Roles -->
        <p-tabPanel header="Utilisateurs">
          <p-card header="Gestion des utilisateurs">
            <div class="mb-4">
              <p-button label="Nouvel utilisateur" icon="pi pi-plus"></p-button>
            </div>
            <p-table [value]="users()" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-user>
                <tr>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <p-tag [value]="user.role" severity="info"></p-tag>
                  </td>
                  <td>
                    <p-tag 
                      [value]="user.isActive ? 'Actif' : 'Inactif'" 
                      [severity]="user.isActive ? 'success' : 'danger'">
                    </p-tag>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <p-button icon="pi pi-pencil" [text]="true" size="small"></p-button>
                      <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger"></p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </p-tabPanel>

        <!-- System Settings -->
        <p-tabPanel header="Système">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <p-card header="Numérotation automatique">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Préfixe produits</label>
                  <input type="text" pInputText value="PRD" class="w-full">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Préfixe ventes</label>
                  <input type="text" pInputText value="SO" class="w-full">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Préfixe achats</label>
                  <input type="text" pInputText value="PO" class="w-full">
                </div>
              </div>
            </p-card>

            <p-card header="Taxes">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Taux TVA par défaut (%)</label>
                  <input type="number" pInputText value="18" class="w-full">
                </div>
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium">Inclure TVA dans les prix</label>
                  <p-inputSwitch [(ngModel)]="includeTax"></p-inputSwitch>
                </div>
              </div>
            </p-card>
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>
  `
})
export class SettingsDashboardComponent implements OnInit {
  companyName = signal<string>('QuincaStock SARL');
  companyAddress = signal<string>('');
  companyPhone = signal<string>('');
  companyEmail = signal<string>('');
  selectedLanguage = signal<string>('fr');
  selectedCurrency = signal<string>('XOF');
  darkMode = signal<boolean>(false);
  includeTax = signal<boolean>(false);
  users = signal<any[]>([]);

  languageOptions = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' }
  ];

  currencyOptions = [
    { label: 'Franc CFA (XOF)', value: 'XOF' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'Dollar US (USD)', value: 'USD' }
  ];

  constructor(
    private translationService: TranslationService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadSettings();
    this.loadUsers();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  changeLanguage() {
    this.translationService.setLanguage(this.selectedLanguage());
  }

  toggleTheme() {
    this.themeService.setTheme(this.darkMode() ? 'dark' : 'light');
  }

  private loadSettings() {
    this.darkMode.set(this.themeService.isDarkMode());
    this.selectedLanguage.set(this.translationService.getLanguage());
  }

  private loadUsers() {
    const mockUsers = [
      {
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@quinca.com',
        role: 'Administrateur',
        isActive: true
      },
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'manager@quinca.com',
        role: 'Manager',
        isActive: true
      },
      {
        firstName: 'Marie',
        lastName: 'Kouassi',
        email: 'cashier@quinca.com',
        role: 'Caissier',
        isActive: true
      }
    ];

    this.users.set(mockUsers);
  }
}