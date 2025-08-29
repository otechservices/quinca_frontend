import { Routes } from '@angular/router';

export const WAREHOUSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./warehouse-list/warehouse-list.component').then(m => m.WarehouseListComponent)
  }
];