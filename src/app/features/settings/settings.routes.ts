import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings-dashboard/settings-dashboard.component').then(m => m.SettingsDashboardComponent)
  }
];