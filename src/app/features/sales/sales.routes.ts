import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sale-list/sale-list.component').then(m => m.SaleListComponent)
  },
  {
    path: 'pos',
    loadComponent: () => import('./pos/pos.component').then(m => m.PosComponent)
  }
];