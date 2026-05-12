import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { Role } from './shared/models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule
  ],
  template: `
    <ng-container *ngIf="isLoggedIn(); else authLayout">
      <mat-sidenav-container class="app-container">
        <mat-sidenav #sidenav [opened]="sidenavOpen()" mode="side" class="app-sidenav">
          <div class="sidenav-header">
            <div class="brand">
              <mat-icon class="brand-icon">confirmation_number</mat-icon>
              <span class="brand-name">HelpDesk Pro</span>
            </div>
            <div class="user-info">
              <div class="user-avatar">{{ userInitials() }}</div>
              <div class="user-details">
                <span class="user-name">{{ currentUser()?.fullName }}</span>
                <span class="user-role">{{ formatRole(currentUser()?.role) }}</span>
              </div>
            </div>
          </div>

          <nav class="sidenav-nav">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a routerLink="/tickets" routerLinkActive="active" class="nav-item">
              <mat-icon>confirmation_number</mat-icon>
              <span>Tickets</span>
            </a>
            <a routerLink="/tickets/new" routerLinkActive="active" class="nav-item">
              <mat-icon>add_circle_outline</mat-icon>
              <span>New Ticket</span>
            </a>
            <ng-container *ngIf="isAdminOrSupport()">
              <div class="nav-section-label">Management</div>
              <a *ngIf="isAdmin()" routerLink="/users" routerLinkActive="active" class="nav-item">
                <mat-icon>people</mat-icon>
                <span>Users</span>
              </a>
              <a *ngIf="isAdmin()" routerLink="/projects" routerLinkActive="active" class="nav-item">
                <mat-icon>folder</mat-icon>
                <span>Projects</span>
              </a>
            </ng-container>
          </nav>

          <div class="sidenav-footer">
            <button class="nav-item logout-btn" (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="app-content">
          <header class="top-bar">
            <button mat-icon-button (click)="toggleSidenav()" class="menu-btn">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="top-bar-right">
              <button mat-icon-button matTooltip="Notifications" class="icon-btn">
                <mat-icon>notifications_none</mat-icon>
              </button>
              <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
                <div class="avatar-sm">{{ userInitials() }}</div>
                <span>{{ currentUser()?.fullName }}</span>
                <mat-icon>expand_more</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu" class="user-dropdown">
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Sign Out</span>
                </button>
              </mat-menu>
            </div>
          </header>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <ng-template #authLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  sidenavOpen = signal(true);

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {}

  isLoggedIn() { return this.authService.isLoggedIn; }
  currentUser() { return this.authService.currentUser; }
  isAdmin() { return this.authService.isAdmin(); }
  isAdminOrSupport() { return this.authService.isAdminOrSupport(); }

  userInitials(): string {
    const name = this.authService.currentUser?.fullName || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatRole(role?: string): string {
    return role?.replace('_', ' ') || '';
  }

  toggleSidenav() { this.sidenavOpen.update(v => !v); }

  logout() { this.authService.logout(); }
}
