import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tickets',
    pathMatch: 'full'
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./components/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
  },
  {
    path: 'tickets/new',
    loadComponent: () =>
      import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
  },
  {
    path: 'tickets/edit/:id',
    loadComponent: () =>
      import('./components/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
  },
  {
    path: 'tickets/view/:id',
    loadComponent: () =>
      import('./components/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'tickets'
  }
];
