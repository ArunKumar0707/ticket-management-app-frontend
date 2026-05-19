import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./components/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
      },
      {
        path: 'tickets/new',
        loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
      },
      {
        path: 'tickets/edit/:id',
        loadComponent: () => import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
      },
      {
        path: 'tickets/view/:id',
        loadComponent: () => import('./components/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./components/project-list/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent)
      },
      {
        path: 'projects/edit/:id',
        loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./components/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
      },
      {
        path: 'employees/new',
        loadComponent: () => import('./components/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
      },
      {
        path: 'employees/edit/:id',
        loadComponent: () => import('./components/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
