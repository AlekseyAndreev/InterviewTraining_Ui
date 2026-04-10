import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'user-info',
    loadComponent: () => import('./pages/user-info/user-info.component').then(m => m.UserInfoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
