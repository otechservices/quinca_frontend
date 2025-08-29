import { Routes } from '@angular/router';

export const PURCHASES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./purchase-list/purchase-list.component').then(m => m.PurchaseListComponent)
  }
];