import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { candidateGuard } from './guards/candidate.guard';

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
    path: 'expert-search',
    loadComponent: () => import('./pages/expert-search/expert-search.component').then(m => m.ExpertSearchComponent),
    canActivate: [candidateGuard]
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
