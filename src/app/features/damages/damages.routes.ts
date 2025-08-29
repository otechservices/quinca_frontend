import { Routes } from '@angular/router';

export const DAMAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./damage-list/damage-list.component').then(m => m.DamageListComponent)
  }
];