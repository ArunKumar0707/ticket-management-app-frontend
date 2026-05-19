import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatIconModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tickets</h1>
          <p class="page-subtitle">{{ dataSource.filteredData.length }} tickets found</p>
        </div>
        <a routerLink="/tickets/new" mat-flat-button class="btn-primary">
          <mat-icon>add</mat-icon> New Ticket
        </a>
      </div>

      <div class="data-table-wrapper animate-in">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <mat-form-field class="search-field" style="max-width:280px;margin:0">
            <mat-icon matPrefix style="color:var(--text-muted);margin-right:6px">search</mat-icon>
            <input matInput placeholder="Search tickets…" [(ngModel)]="searchText" (ngModelChange)="applyFilter()">
            @if (searchText) {
              <button matSuffix mat-icon-button (click)="searchText=''; applyFilter()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <div class="filter-row">
            <mat-form-field style="width:140px;margin:0">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="OPEN">Open</mat-option>
                <mat-option value="IN_PROGRESS">In Progress</mat-option>
                <mat-option value="RESOLVED">Resolved</mat-option>
                <mat-option value="CLOSED">Closed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field style="width:130px;margin:0">
              <mat-label>Priority</mat-label>
              <mat-select [(ngModel)]="filterPriority" (ngModelChange)="applyFilter()">
                <mat-option value="">All</mat-option>
                <mat-option value="HIGH">High</mat-option>
                <mat-option value="MEDIUM">Medium</mat-option>
                <mat-option value="LOW">Low</mat-option>
              </mat-select>
            </mat-form-field>

            @if (filterStatus || filterPriority || searchText) {
              <button mat-button (click)="clearFilters()" style="color:var(--text-muted)">
                <mat-icon>filter_alt_off</mat-icon> Clear
              </button>
            }
          </div>
        </div>

        @if (loading) {
          <div style="display:flex;align-items:center;justify-content:center;padding:60px">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {

          <table mat-table [dataSource]="dataSource" matSort>
            <!-- ID -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>#</th>
              <td mat-cell *matCellDef="let t">
                <span class="mono-id">#{{ t.id }}</span>
              </td>
            </ng-container>

            <!-- Title -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
              <td mat-cell *matCellDef="let t">
                <a class="ticket-link" [routerLink]="['/tickets/view', t.id]">{{ t.title }}</a>
                @if (t.projectName) {
                  <div class="meta-chip">{{ t.projectName }}</div>
                }
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let t">
                <span class="badge" [class]="'badge-' + t.status.toLowerCase()">
                  {{ t.status.replace('_',' ') }}
                </span>
              </td>
            </ng-container>

            <!-- Priority -->
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
              <td mat-cell *matCellDef="let t">
                <span class="priority-label" [class]="t.priority.toLowerCase()">
                  <span class="priority-dot"></span>
                  {{ t.priority }}
                </span>
              </td>
            </ng-container>

            <!-- Assignee -->
            <ng-container matColumnDef="assigneeName">
              <th mat-header-cell *matHeaderCellDef>Assignee</th>
              <td mat-cell *matCellDef="let t">
                <span style="color:var(--text-secondary);font-size:13px">{{ t.assigneeName || '—' }}</span>
              </td>
            </ng-container>

            <!-- Date -->
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let t">
                <span style="color:var(--text-muted);font-size:12px">{{ t.createdAt | date:'MMM d, y' }}</span>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let t">
                <div class="action-cell">
                  <a [routerLink]="['/tickets/view', t.id]" mat-icon-button matTooltip="View">
                    <mat-icon>visibility</mat-icon>
                  </a>
                  <a [routerLink]="['/tickets/edit', t.id]" mat-icon-button matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button matTooltip="Delete" (click)="confirmDelete(t)" style="color:var(--danger)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="columns.length">
                <div class="empty-state">
                  <mat-icon>search_off</mat-icon>
                  <h3>No tickets found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          </table>

          <mat-paginator [pageSizeOptions]="[10, 25, 50]" pageSize="10" showFirstLastButtons />
        }
      </div>
    </div>
  `,
  styles: [`
    .filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .mono-id { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-muted); font-weight: 500; }
    .ticket-link { color: var(--text-primary); text-decoration: none; font-weight: 600; font-size: 13px; }
    .ticket-link:hover { color: var(--accent); }
    .meta-chip { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .action-cell { display: flex; align-items: center; gap: 2px; opacity: 0; transition: opacity 150ms; }
    tr:hover .action-cell { opacity: 1; }
  `]
})
export class TicketListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['id', 'title', 'status', 'priority', 'assigneeName', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Ticket>([]);
  loading = true;
  searchText = '';
  filterStatus = '';
  filterPriority = '';

  constructor(private ticketService: TicketService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.ticketService.getAll().subscribe({
      next: tickets => {
        this.dataSource.data = tickets;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.buildFilterFn();
        this.loading = false;
      },
      error: () => { this.loading = false; this.snackBar.open('Failed to load tickets', 'Dismiss'); }
    });
  }

  buildFilterFn() {
    return (t: Ticket, filter: string): boolean => {
      const f = JSON.parse(filter);
      const text = f.text.toLowerCase();
      const matchText = !text || t.title.toLowerCase().includes(text) ||
        (t.projectName || '').toLowerCase().includes(text) ||
        (t.assigneeName || '').toLowerCase().includes(text);
      const matchStatus = !f.status || t.status === f.status;
      const matchPriority = !f.priority || t.priority === f.priority;
      return matchText && matchStatus && matchPriority;
    };
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ text: this.searchText, status: this.filterStatus, priority: this.filterPriority });
    this.dataSource.paginator?.firstPage();
  }

  clearFilters(): void {
    this.searchText = ''; this.filterStatus = ''; this.filterPriority = '';
    this.applyFilter();
  }

  confirmDelete(ticket: Ticket): void {
    if (!confirm(`Delete ticket "${ticket.title}"?`)) return;
    this.ticketService.delete(ticket.id).subscribe({
      next: () => {
        this.snackBar.open('Ticket deleted', 'OK', { panelClass: 'toast-success' });
        this.load();
      },
      error: () => this.snackBar.open('Failed to delete ticket', 'Dismiss', { panelClass: 'toast-error' })
    });
  }
}
