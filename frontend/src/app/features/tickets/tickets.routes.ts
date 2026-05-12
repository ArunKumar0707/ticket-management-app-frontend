import { Routes } from '@angular/router';

export const TICKET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ticket-list.component').then(m => m.TicketListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./ticket-form.component').then(m => m.TicketFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./ticket-detail.component').then(m => m.TicketDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./ticket-form.component').then(m => m.TicketFormComponent)
  }
];
