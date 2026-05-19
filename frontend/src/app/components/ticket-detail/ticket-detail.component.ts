import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Ticket Detail</h1>
          <p class="page-subtitle">Full ticket information</p>
        </div>
        <a routerLink="/tickets" mat-button class="btn-ghost">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:80px">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (ticket) {
        <div class="detail-layout animate-in">
          <!-- Main Info -->
          <div class="detail-main">
            <div class="detail-header">
              <div class="detail-id">#{{ ticket.id }}</div>
              <div class="detail-badges">
                <span class="badge" [class]="'badge-' + ticket.status.toLowerCase()">
                  {{ ticket.status.replace('_', ' ') }}
                </span>
                <span class="priority-label" [class]="ticket.priority.toLowerCase()">
                  <span class="priority-dot"></span>
                  {{ ticket.priority }}
                </span>
              </div>
            </div>

            <h2 class="detail-title">{{ ticket.title }}</h2>

            <div class="detail-section">
              <div class="detail-section-label">Description</div>
              <p class="detail-description">
                {{ ticket.description || 'No description provided.' }}
              </p>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div class="detail-sidebar">
            <div class="detail-card">
              <div class="detail-card-title">Details</div>

              <div class="detail-row">
                <mat-icon class="detail-row-icon">folder_open</mat-icon>
                <div>
                  <div class="detail-row-label">Project</div>
                  <div class="detail-row-value">{{ ticket.projectName || 'No Project' }}</div>
                </div>
              </div>

              <div class="detail-row">
                <mat-icon class="detail-row-icon">person</mat-icon>
                <div>
                  <div class="detail-row-label">Assignee</div>
                  <div class="detail-row-value">{{ ticket.assigneeName || 'Unassigned' }}</div>
                </div>
              </div>

              <div class="detail-row">
                <mat-icon class="detail-row-icon">calendar_today</mat-icon>
                <div>
                  <div class="detail-row-label">Created</div>
                  <div class="detail-row-value">{{ ticket.createdAt | date:'MMM d, y, h:mm a' }}</div>
                </div>
              </div>

              <div class="detail-row">
                <mat-icon class="detail-row-icon">update</mat-icon>
                <div>
                  <div class="detail-row-label">Last Updated</div>
                  <div class="detail-row-value">{{ ticket.updatedAt | date:'MMM d, y, h:mm a' }}</div>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <a [routerLink]="['/tickets/edit', ticket.id]" mat-flat-button class="btn-primary" style="width:100%">
                <mat-icon>edit</mat-icon> Edit Ticket
              </a>
              <button mat-button (click)="deleteTicket()" style="width:100%;color:var(--danger);margin-top:8px">
                <mat-icon>delete</mat-icon> Delete Ticket
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: start;
    }

    .detail-main {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 28px 32px;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .detail-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-surface-2);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
    }

    .detail-badges { display: flex; align-items: center; gap: 10px; }

    .detail-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 24px;
      line-height: 1.4;
    }

    .detail-section { margin-top: 20px; }

    .detail-section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .detail-description {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.75;
      white-space: pre-wrap;
    }

    /* Sidebar */
    .detail-sidebar { display: flex; flex-direction: column; gap: 16px; }

    .detail-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
    }

    .detail-card-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    .detail-row:last-child { border-bottom: none; }

    .detail-row-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      margin-top: 2px;
      flex-shrink: 0;
    }

    .detail-row-label { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
    .detail-row-value { font-size: 13px; font-weight: 500; color: var(--text-primary); }

    .detail-actions { display: flex; flex-direction: column; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.ticketService.getById(id).subscribe({
      next: t => { this.ticket = t; this.loading = false; },
      error: () => { this.loading = false; this.snackBar.open('Ticket not found', 'Dismiss'); this.router.navigate(['/tickets']); }
    });
  }

  deleteTicket(): void {
    if (!this.ticket || !confirm(`Delete ticket "${this.ticket.title}"?`)) return;
    this.ticketService.delete(this.ticket.id).subscribe({
      next: () => {
        this.snackBar.open('Ticket deleted', 'OK', { panelClass: 'toast-success' });
        this.router.navigate(['/tickets']);
      },
      error: () => this.snackBar.open('Delete failed', 'Dismiss', { panelClass: 'toast-error' })
    });
  }
}
