import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { candidateGuard } from './guards/candidate.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'my-user-info',
    loadComponent: () => import('./pages/my-user-info/my-user-info.component').then(m => m.MyUserInfoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-info/:userId',
    loadComponent: () => import('./pages/user-info/user-info.component').then(m => m.UserInfoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expert-search',
    loadComponent: () => import('./pages/expert-search/expert-search.component').then(m => m.ExpertSearchComponent),
    canActivate: [candidateGuard]
  },
  {
    path: 'book-interview/:expertId',
    loadComponent: () => import('./pages/book-interview/book-interview.component').then(m => m.BookInterviewComponent),
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
