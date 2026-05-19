import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, Ticket } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back — here's what's happening</p>
        </div>
        <a routerLink="/tickets/new" mat-flat-button class="btn-primary">
          <mat-icon>add</mat-icon> New Ticket
        </a>
      </div>

      @if (loading) {
        <div class="loading-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (stats) {
        <!-- Ticket Status Cards -->
        <div class="stats-grid animate-in">
          <div class="stat-card">
            <div class="stat-icon" style="background:var(--info-light);color:var(--info)">
              <mat-icon>confirmation_number</mat-icon>
            </div>
            <div>
              <div class="stat-value">{{ stats.totalTickets }}</div>
              <div class="stat-label">Total Tickets</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:var(--info-light);color:var(--info)">
              <mat-icon>radio_button_unchecked</mat-icon>
            </div>
            <div>
              <div class="stat-value" style="color:var(--info)">{{ stats.openTickets }}</div>
              <div class="stat-label">Open</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:var(--warning-light);color:var(--warning)">
              <mat-icon>pending</mat-icon>
            </div>
            <div>
              <div class="stat-value" style="color:var(--warning)">{{ stats.inProgressTickets }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:var(--success-light);color:var(--success)">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div>
              <div class="stat-value" style="color:var(--success)">{{ stats.resolvedTickets }}</div>
              <div class="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        <!-- Secondary Stats -->
        <div class="secondary-grid">
          <!-- Priority Breakdown -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">Priority Distribution</h3>
            </div>
            <div class="priority-bars">
              <div class="priority-row">
                <div class="priority-info">
                  <span class="priority-dot-lg high"></span>
                  <span>High</span>
                </div>
                <div class="bar-wrap">
                  <div class="bar high" [style.width.%]="pct(stats.highPriorityTickets)"></div>
                </div>
                <span class="priority-count">{{ stats.highPriorityTickets }}</span>
              </div>
              <div class="priority-row">
                <div class="priority-info">
                  <span class="priority-dot-lg medium"></span>
                  <span>Medium</span>
                </div>
                <div class="bar-wrap">
                  <div class="bar medium" [style.width.%]="pct(stats.mediumPriorityTickets)"></div>
                </div>
                <span class="priority-count">{{ stats.mediumPriorityTickets }}</span>
              </div>
              <div class="priority-row">
                <div class="priority-info">
                  <span class="priority-dot-lg low"></span>
                  <span>Low</span>
                </div>
                <div class="bar-wrap">
                  <div class="bar low" [style.width.%]="pct(stats.lowPriorityTickets)"></div>
                </div>
                <span class="priority-count">{{ stats.lowPriorityTickets }}</span>
              </div>
            </div>
          </div>

          <!-- Project & Employee Summary -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">Overview</h3>
            </div>
            <div class="overview-items">
              <a routerLink="/projects" class="overview-item">
                <div class="ov-icon" style="background:var(--accent-light);color:var(--accent)">
                  <mat-icon>folder_open</mat-icon>
                </div>
                <div>
                  <div class="ov-value">{{ stats.activeProjects }} <span>/ {{ stats.totalProjects }}</span></div>
                  <div class="ov-label">Active Projects</div>
                </div>
                <mat-icon class="ov-arrow">chevron_right</mat-icon>
              </a>
              <a routerLink="/employees" class="overview-item">
                <div class="ov-icon" style="background:var(--success-light);color:var(--success)">
                  <mat-icon>group</mat-icon>
                </div>
                <div>
                  <div class="ov-value">{{ stats.activeEmployees }} <span>/ {{ stats.totalEmployees }}</span></div>
                  <div class="ov-label">Active Employees</div>
                </div>
                <mat-icon class="ov-arrow">chevron_right</mat-icon>
              </a>
              <a routerLink="/tickets" class="overview-item">
                <div class="ov-icon" style="background:var(--danger-light);color:var(--danger)">
                  <mat-icon>priority_high</mat-icon>
                </div>
                <div>
                  <div class="ov-value">{{ stats.closedTickets }}</div>
                  <div class="ov-label">Closed Tickets</div>
                </div>
                <mat-icon class="ov-arrow">chevron_right</mat-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- Recent Tickets -->
        <div class="panel" style="margin-top:0">
          <div class="panel-header">
            <h3 class="panel-title">Recent Tickets</h3>
            <a routerLink="/tickets" mat-button style="color:var(--accent);font-size:13px">View All</a>
          </div>
          @if (recentTickets.length === 0) {
            <div class="empty-state">
              <mat-icon>confirmation_number</mat-icon>
              <h3>No tickets yet</h3>
              <p>Create your first ticket to get started</p>
            </div>
          } @else {
            <div class="recent-list">
              @for (ticket of recentTickets; track ticket.id) {
                <a class="recent-row" [routerLink]="['/tickets/view', ticket.id]">
                  <div class="recent-left">
                    <span class="ticket-id">#{{ ticket.id }}</span>
                    <div>
                      <div class="recent-title">{{ ticket.title }}</div>
                      <div class="recent-meta">
                        {{ ticket.projectName || 'No Project' }} &middot; {{ ticket.assigneeName || 'Unassigned' }}
                      </div>
                    </div>
                  </div>
                  <div class="recent-right">
                    <span class="badge" [class]="'badge-' + ticket.status.toLowerCase()">
                      {{ formatStatus(ticket.status) }}
                    </span>
                    <span class="priority-label" [class]="ticket.priority.toLowerCase()">
                      <span class="priority-dot"></span>
                      {{ ticket.priority }}
                    </span>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .secondary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .panel {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border);
    }

    .panel-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Priority bars */
    .priority-bars { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .priority-row { display: flex; align-items: center; gap: 12px; }
    .priority-info { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); width: 70px; flex-shrink: 0; }
    .priority-dot-lg { width: 10px; height: 10px; border-radius: 50%; }
    .priority-dot-lg.high   { background: var(--danger);  }
    .priority-dot-lg.medium { background: var(--warning); }
    .priority-dot-lg.low    { background: var(--success); }
    .bar-wrap { flex: 1; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .bar { height: 100%; border-radius: 99px; transition: width 600ms cubic-bezier(.4,0,.2,1); min-width: 4px; }
    .bar.high   { background: var(--danger);  }
    .bar.medium { background: var(--warning); }
    .bar.low    { background: var(--success); }
    .priority-count { font-size: 13px; font-weight: 700; color: var(--text-primary); width: 24px; text-align: right; }

    /* Overview items */
    .overview-items { padding: 8px; display: flex; flex-direction: column; gap: 4px; }
    .overview-item {
      display: flex; align-items: center; gap: 14px;
      padding: 12px; border-radius: var(--radius-sm);
      text-decoration: none; color: var(--text-primary);
      transition: background var(--transition);
    }
    .overview-item:hover { background: var(--bg-surface-2); }
    .ov-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
    .ov-value { font-size: 18px; font-weight: 800; }
    .ov-value span { font-size: 13px; font-weight: 400; color: var(--text-muted); }
    .ov-label { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
    .ov-arrow { margin-left: auto; color: var(--text-muted); font-size: 18px; }

    /* Recent tickets */
    .recent-list { display: flex; flex-direction: column; }
    .recent-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; border-bottom: 1px solid var(--border-subtle);
      text-decoration: none; color: var(--text-primary);
      transition: background var(--transition);
    }
    .recent-row:last-child { border-bottom: none; }
    .recent-row:hover { background: var(--bg-surface-2); }
    .recent-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .ticket-id { font-size: 11px; font-weight: 700; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
    .recent-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px; }
    .recent-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .recent-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

    /* Skeleton */
    .loading-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .skeleton-card { height: 90px; border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border); animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

    @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 768px)  { .secondary-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentTickets: Ticket[] = [];
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.dashboardService.getRecentTickets(8).subscribe(t => this.recentTickets = t);
  }

  pct(val: number): number {
    if (!this.stats || this.stats.totalTickets === 0) return 0;
    return Math.round((val / this.stats.totalTickets) * 100);
  }

  formatStatus(s: string): string {
    return s.replace('_', ' ');
  }
}
