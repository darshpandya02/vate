import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'swipe', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: 'swipe', loadComponent: () => import('./features/swipe/swipe.component').then(m => m.SwipeComponent) },
      { path: 'groups', loadComponent: () => import('./features/groups/groups.component').then(m => m.GroupsComponent) },
      { path: 'groups/:id', loadComponent: () => import('./features/groups/group-detail.component').then(m => m.GroupDetailComponent) },
      { path: 'matches', loadComponent: () => import('./features/matches/matches.component').then(m => m.MatchesComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
    ],
  },
  { path: '**', redirectTo: 'swipe' },
];
