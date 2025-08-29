import { Routes } from '@angular/router';

export const VARIANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./variant-list/variant-list.component').then(m => m.VariantListComponent)
  }
];