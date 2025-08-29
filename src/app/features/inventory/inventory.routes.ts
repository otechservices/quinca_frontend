import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'movements',
    pathMatch: 'full'
  },
  {
    path: 'movements',
    loadComponent: () => import('./movements/movements.component').then(m => m.MovementsComponent)
  },
  {
    path: 'transfers',
    loadComponent: () => import('./transfers/transfers.component').then(m => m.TransfersComponent)
  },
  {
    path: 'adjustments',
    loadComponent: () => import('./adjustments/adjustments.component').then(m => m.AdjustmentsComponent)
  },
  {
    path: 'counts',
    loadComponent: () => import('./counts/counts.component').then(m => m.CountsComponent)
  }
];