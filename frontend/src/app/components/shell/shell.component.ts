import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="shell" [class.sidebar-collapsed]="collapsed()">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">TF</div>
            <span class="logo-text">TicketFlow</span>
          </div>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())" [matTooltip]="collapsed() ? 'Expand' : 'Collapse'">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="nav-group-label">Main</span>
            @for (item of mainNav; track item.route) {
              <a class="nav-item" [routerLink]="item.route" routerLinkActive="active"
                 [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          </div>
          <div class="nav-group">
            <span class="nav-group-label">Management</span>
            @for (item of mgmtNav; track item.route) {
              <a class="nav-item" [routerLink]="item.route" routerLinkActive="active"
                 [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="theme-toggle" (click)="themeService.toggle()"
               [matTooltip]="themeService.isDark() ? 'Light Mode' : 'Dark Mode'" matTooltipPosition="right">
            <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            <span class="nav-label">{{ themeService.isDark() ? 'Light Mode' : 'Dark Mode' }}</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-area">
        <header class="topbar">
          <button class="mobile-menu-btn" (click)="collapsed.set(!collapsed())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-right">
            <button class="icon-btn" (click)="themeService.toggle()" [matTooltip]="themeService.isDark() ? 'Light Mode' : 'Dark Mode'">
              <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            <div class="avatar" matTooltip="Profile">JD</div>
          </div>
        </header>

        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-base);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      transition: width 250ms cubic-bezier(.4,0,.2,1), min-width 250ms cubic-bezier(.4,0,.2,1);
      overflow: hidden;
      z-index: 100;
      border-right: 1px solid rgba(255,255,255,0.04);
    }

    .shell.sidebar-collapsed .sidebar {
      width: 64px;
      min-width: 64px;
    }

    .shell.sidebar-collapsed .logo-text,
    .shell.sidebar-collapsed .nav-label,
    .shell.sidebar-collapsed .nav-group-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.5px;
    }

    .logo-text {
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      white-space: nowrap;
      transition: opacity 200ms, width 200ms;
    }

    .collapse-btn {
      background: none;
      border: none;
      color: var(--sidebar-text);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 150ms, background 150ms;
      flex-shrink: 0;
    }
    .collapse-btn:hover { color: #fff; background: var(--sidebar-hover); }

    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .nav-group { display: flex; flex-direction: column; gap: 2px; }

    .nav-group-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(148,163,184,0.5);
      padding: 0 8px 6px;
      white-space: nowrap;
      transition: opacity 200ms;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 8px;
      color: var(--sidebar-text);
      text-decoration: none;
      transition: background 150ms, color 150ms;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-item:hover { background: var(--sidebar-hover); color: #fff; }
    .nav-item.active { background: rgba(99,102,241,0.15); color: var(--sidebar-active); }
    .nav-item.active .nav-icon { color: var(--sidebar-active); }

    .nav-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .nav-label { font-size: 13px; font-weight: 500; transition: opacity 200ms, width 200ms; }

    .sidebar-footer {
      padding: 12px 10px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 8px;
      color: var(--sidebar-text);
      cursor: pointer;
      transition: background 150ms, color 150ms;
      overflow: hidden;
    }
    .theme-toggle:hover { background: var(--sidebar-hover); color: #fff; }
    .theme-toggle mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }

    /* ── Main Area ── */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      height: 56px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 10;
      flex-shrink: 0;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 150ms, color 150ms;
    }
    .icon-btn:hover { background: var(--bg-surface-2); color: var(--text-primary); }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      letter-spacing: 0.5px;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn { display: flex; }
      .sidebar { position: fixed; top: 0; left: 0; height: 100%; z-index: 200; }
      .shell.sidebar-collapsed .sidebar { width: 0; min-width: 0; }
      .collapse-btn { display: none; }
    }
  `]
})
export class ShellComponent {
  collapsed = signal(false);

  mainNav: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Tickets',   icon: 'confirmation_number', route: '/tickets' }
  ];

  mgmtNav: NavItem[] = [
    { label: 'Projects',  icon: 'folder_open', route: '/projects' },
    { label: 'Employees', icon: 'group',        route: '/employees' }
  ];

  constructor(public themeService: ThemeService) {}
}
