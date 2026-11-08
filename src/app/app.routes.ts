import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'FOLLAR — Vestiaire essentiel, Paris',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'piece/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetailPage),
  },
  {
    path: 'admin',
    title: 'Administration — FOLLAR',
    loadComponent: () =>
      import('./pages/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: 'superadmin',
    title: 'Super Administration — FOLLAR',
    loadComponent: () =>
      import('./pages/superadmin/superadmin').then((m) => m.SuperAdminComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
