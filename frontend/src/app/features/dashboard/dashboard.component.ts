import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardApiService } from '../../core/services/api.service';
import { DashboardData } from '../../shared/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, BaseChartDirective
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Welcome back, {{ authService.currentUser?.fullName }} · {{ today | date:'EEEE, MMMM d' }}</p>
        </div>
        <a mat-raised-button routerLink="/tickets/new" class="btn-primary">
          <mat-icon>add</mat-icon> New Ticket
        </a>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading && data">
        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card accent">
            <div class="stat-icon"><mat-icon>confirmation_number</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data.totalTickets }}</div>
              <div class="stat-label">Total Tickets</div>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon"><mat-icon>folder_open</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data.openTickets }}</div>
              <div class="stat-label">Open Tickets</div>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon"><mat-icon>check_circle_outline</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data.resolvedTickets }}</div>
              <div class="stat-label">Resolved</div>
            </div>
          </div>
          <div class="stat-card danger">
            <div class="stat-icon"><mat-icon>priority_high</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data.criticalTickets }}</div>
              <div class="stat-label">Critical (P1)</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon"><mat-icon>timelapse</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data.slaBreachedTickets }}</div>
              <div class="stat-label">SLA Breached</div>
            </div>
          </div>
          <div class="stat-card accent">
            <div class="stat-icon"><mat-icon>schedule</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ avgResolutionFormatted }}</div>
              <div class="stat-label">Avg Resolution</div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
          <!-- Status Distribution -->
          <div class="card">
            <div class="card-header"><span class="card-title">Ticket Status</span></div>
            <div class="chart-wrapper">
              <canvas baseChart [data]="statusChartData" [type]="'doughnut'"
                      [options]="doughnutOptions"></canvas>
            </div>
          </div>

          <!-- Priority Distribution -->
          <div class="card">
            <div class="card-header"><span class="card-title">Priority Breakdown</span></div>
            <div class="chart-wrapper">
              <canvas baseChart [data]="priorityChartData" [type]="'bar'"
                      [options]="barOptions"></canvas>
            </div>
          </div>

          <!-- Monthly Trends -->
          <div class="card chart-wide">
            <div class="card-header"><span class="card-title">Monthly Ticket Volume (12 months)</span></div>
            <div class="chart-wrapper">
              <canvas baseChart [data]="trendChartData" [type]="'line'"
                      [options]="lineOptions"></canvas>
            </div>
          </div>
        </div>

        <!-- Workload Table -->
        <div class="card" *ngIf="data.employeeWorkload?.length">
          <div class="card-header">
            <span class="card-title">Team Workload</span>
          </div>
          <div class="workload-list">
            <div class="workload-item" *ngFor="let emp of data.employeeWorkload">
              <div class="emp-info">
                <div class="emp-avatar">{{ empInitials(emp.employeeName) }}</div>
                <span class="emp-name">{{ emp.employeeName }}</span>
              </div>
              <div class="workload-bar-wrap">
                <div class="workload-bar">
                  <div class="workload-fill" [style.width.%]="barWidth(emp.ticketCount)"></div>
                </div>
                <span class="ticket-count">{{ emp.ticketCount }} tickets</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1400px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 24px;

      .chart-wide { grid-column: span 3; }
    }

    .chart-wrapper {
      position: relative;
      height: 220px;
      canvas { max-height: 220px; }
    }

    .workload-list { display: flex; flex-direction: column; gap: 12px; }
    .workload-item {
      display: flex; align-items: center; gap: 20px;
      .emp-info { display: flex; align-items: center; gap: 10px; min-width: 200px; }
      .emp-avatar {
        width: 32px; height: 32px; border-radius: 50%;
        background: var(--accent); display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 600; flex-shrink: 0;
      }
      .emp-name { font-size: 13px; color: var(--text-primary); }
    }
    .workload-bar-wrap { flex: 1; display: flex; align-items: center; gap: 12px; }
    .workload-bar {
      flex: 1; height: 8px; background: var(--bg-tertiary);
      border-radius: 4px; overflow: hidden;
    }
    .workload-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-light));
      border-radius: 4px; transition: width 0.5s ease;
    }
    .ticket-count { font-size: 12px; color: var(--text-secondary); min-width: 70px; text-align: right; }

    @media (max-width: 1100px) {
      .charts-grid { grid-template-columns: repeat(2, 1fr); .chart-wide { grid-column: span 2; } }
    }
    @media (max-width: 700px) {
      .charts-grid { grid-template-columns: 1fr; .chart-wide { grid-column: span 1; } }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  data: DashboardData | null = null;
  today = new Date();

  statusChartData: ChartData<'doughnut'> = { datasets: [], labels: [] };
  priorityChartData: ChartData<'bar'> = { datasets: [], labels: [] };
  trendChartData: ChartData<'line'> = { datasets: [], labels: [] };

  doughnutOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#8b949e', boxWidth: 12, padding: 16 } } }
  };

  barOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(48,54,61,0.5)' } },
      y: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(48,54,61,0.5)' } }
    }
  };

  lineOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(48,54,61,0.5)' } },
      y: { ticks: { color: '#8b949e', stepSize: 1 }, grid: { color: 'rgba(48,54,61,0.5)' } }
    },
    elements: { line: { tension: 0.4 } }
  };

  constructor(private dashboardApi: DashboardApiService, public authService: AuthService) {}

  ngOnInit() {
    this.dashboardApi.getDashboard().subscribe({
      next: (res) => { this.data = res.data; this.buildCharts(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  buildCharts() {
    if (!this.data) return;

    const statusColors = ['#60a5fa','#a78bfa','#fb923c','#34d399','#9ca3af','#f87171'];
    const statusLabels = Object.keys(this.data.statusDistribution).map(s => s.replace('_', ' '));
    this.statusChartData = {
      labels: statusLabels,
      datasets: [{ data: Object.values(this.data.statusDistribution), backgroundColor: statusColors, borderWidth: 0 }]
    };

    const prioColors = ['#f87171','#fb923c','#fbbf24','#4ade80'];
    const prioLabels = Object.keys(this.data.priorityDistribution).map(p => p.replace('_', ' '));
    this.priorityChartData = {
      labels: prioLabels,
      datasets: [{ data: Object.values(this.data.priorityDistribution), backgroundColor: prioColors, borderRadius: 6 }]
    };

    this.trendChartData = {
      labels: this.data.monthlyTrends.map(t => t.month),
      datasets: [{
        data: this.data.monthlyTrends.map(t => t.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4
      }]
    };
  }

  get avgResolutionFormatted(): string {
    const m = this.data?.avgResolutionTimeMinutes;
    if (!m) return 'N/A';
    const h = Math.floor(m / 60);
    return h >= 24 ? `${Math.floor(h/24)}d` : `${h}h`;
  }

  maxWorkload(): number {
    return Math.max(...(this.data?.employeeWorkload?.map(e => e.ticketCount) || [1]));
  }

  barWidth(count: number): number {
    return (count / this.maxWorkload()) * 100;
  }

  empInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
