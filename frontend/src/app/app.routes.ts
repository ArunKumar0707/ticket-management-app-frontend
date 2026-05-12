import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { Role } from './shared/models/models';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tickets',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/tickets/tickets.routes').then(m => m.TICKET_ROUTES)
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] },
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] },
    loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
