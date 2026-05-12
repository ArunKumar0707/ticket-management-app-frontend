import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { TicketApiService, ProjectApiService, UserApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket, Project, User, TicketFilter, Priority, TicketStatus, SupportLevel, Role } from '../../shared/models/models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTooltipModule,
    MatMenuModule, MatProgressSpinnerModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="ticket-list-page">
      <div class="page-header">
        <div>
          <h1>{{ isAssigned ? 'Assigned to Me' : isMyTickets ? 'My Tickets' : 'All Tickets' }}</h1>
          <p class="subtitle">{{ totalElements }} tickets found</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportExcel()" class="btn-secondary" matTooltip="Export to Excel">
            <mat-icon>download</mat-icon> Export
          </button>
          <a mat-raised-button routerLink="/tickets/new" class="btn-primary">
            <mat-icon>add</mat-icon> New Ticket
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar" [formGroup]="filterForm">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Search</mat-label>
          <input matInput formControlName="search" placeholder="Ticket # or description">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Project</mat-label>
          <mat-select formControlName="projectId">
            <mat-option value="">All Projects</mat-option>
            <mat-option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">All Status</mat-option>
            <mat-option *ngFor="let s of statusOptions" [value]="s.value">{{ s.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="">All Priority</mat-option>
            <mat-option *ngFor="let p of priorityOptions" [value]="p.value">{{ p.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field" *ngIf="isAdminOrSupport()">
          <mat-label>Assignee</mat-label>
          <mat-select formControlName="assignedToId">
            <mat-option value="">All Engineers</mat-option>
            <mat-option *ngFor="let u of engineers" [value]="u.id">{{ u.fullName }}</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="resetFilters()" class="btn-secondary reset-btn">
          <mat-icon>clear</mat-icon> Reset
        </button>
      </div>

      <!-- Table -->
      <div class="data-table-container">
        <div *ngIf="loading" class="loading-overlay" style="padding:40px">
          <mat-spinner diameter="36"></mat-spinner>
        </div>

        <table mat-table [dataSource]="tickets" *ngIf="!loading">
          <ng-container matColumnDef="ticketNumber">
            <th mat-header-cell *matHeaderCellDef>Ticket #</th>
            <td mat-cell *matCellDef="let t">
              <span class="ticket-number">{{ t.ticketNumber }}</span>
              <span *ngIf="t.slaBreached" class="sla-badge">SLA!</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="project">
            <th mat-header-cell *matHeaderCellDef>Project</th>
            <td mat-cell *matCellDef="let t">{{ t.projectName }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let t">
              <span class="desc-cell">{{ t.issueDescription | slice:0:80 }}{{ t.issueDescription.length > 80 ? '...' : '' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>Assigned To</th>
            <td mat-cell *matCellDef="let t">
              <span *ngIf="t.assignedToName" class="assignee">
                <span class="assignee-avatar">{{ initials(t.assignedToName) }}</span>
                {{ t.assignedToName }}
              </span>
              <span *ngIf="!t.assignedToName" class="unassigned">Unassigned</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let t">
              <span class="badge priority-{{t.priority}}">{{ priorityLabel(t.priority) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let t">
              <span class="badge status-{{t.currentStatus}}">{{ t.currentStatus | titlecase | replace:'_':' ' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="supportLevel">
            <th mat-header-cell *matHeaderCellDef>Level</th>
            <td mat-cell *matCellDef="let t">
              <span class="badge level-{{t.supportLevel}}">{{ t.supportLevel }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let t" class="text-muted text-sm">
              {{ t.generationDateTime | date:'MMM d, HH:mm' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu" (click)="$event.stopPropagation()">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item [routerLink]="['/tickets', t.id]">
                  <mat-icon>visibility</mat-icon> View Details
                </button>
                <button mat-menu-item [routerLink]="['/tickets', t.id, 'edit']">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="deleteTicket(t)" *ngIf="isAdmin()" style="color: var(--danger-light)">
                  <mat-icon>delete_outline</mat-icon> Delete
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              (click)="viewTicket(row)"></tr>
        </table>

        <div *ngIf="!loading && tickets.length === 0" class="empty-state">
          <mat-icon>inbox</mat-icon>
          <h3>No tickets found</h3>
          <p>Try adjusting your filters or create a new ticket</p>
        </div>

        <mat-paginator
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .ticket-list-page { max-width: 1400px; }
    .header-actions { display: flex; gap: 12px; }
    .filter-field { min-width: 160px; max-width: 200px; }
    .filters-bar { flex-wrap: wrap; gap: 12px; }

    .desc-cell { display: block; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .assignee { display: flex; align-items: center; gap: 6px; font-size: 13px; }
    .assignee-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--accent); display: inline-flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 600; flex-shrink: 0;
    }
    .unassigned { color: var(--text-muted); font-size: 12px; font-style: italic; }

    .sla-badge {
      margin-left: 6px; padding: 1px 6px;
      background: rgba(220,38,38,0.15); color: var(--danger-light);
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: 10px; font-size: 9px; font-weight: 700; vertical-align: middle;
    }

    .reset-btn { height: 56px; }
  `]
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  projects: Project[] = [];
  engineers: User[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  filterForm: FormGroup;

  isMyTickets = false;
  isAssigned = false;

  displayedColumns = ['ticketNumber', 'project', 'description', 'assignedTo', 'priority', 'status', 'supportLevel', 'createdAt', 'actions'];

  statusOptions = [
    { value: 'OPEN', label: 'Open' }, { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ON_HOLD', label: 'On Hold' }, { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }, { value: 'REOPENED', label: 'Reopened' }
  ];

  priorityOptions = [
    { value: 'P1_CRITICAL', label: 'P1 - Critical' }, { value: 'P2_HIGH', label: 'P2 - High' },
    { value: 'P3_MEDIUM', label: 'P3 - Medium' }, { value: 'P4_LOW', label: 'P4 - Low' }
  ];

  constructor(
    private fb: FormBuilder,
    private ticketApi: TicketApiService,
    private projectApi: ProjectApiService,
    private userApi: UserApiService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      search: [''], projectId: [''], status: [''], priority: [''], assignedToId: ['']
    });
  }

  ngOnInit() {
    this.loadProjects();
    if (this.isAdminOrSupport()) this.loadEngineers();
    this.loadTickets();

    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadTickets();
    });
  }

  loadProjects() {
    this.projectApi.getActiveProjects().subscribe(res => this.projects = res.data);
  }

  loadEngineers() {
    this.userApi.getSupportEngineers().subscribe(res => this.engineers = res.data);
  }

  loadTickets() {
    this.loading = true;
    const f = this.filterForm.value;
    const filter: TicketFilter = {
      ...f,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'createdAt',
      sortDir: 'desc'
    };

    this.ticketApi.getAllTickets(filter).subscribe({
      next: (res) => {
        this.tickets = res.data.content;
        this.totalElements = res.data.totalElements;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTickets();
  }

  resetFilters() {
    this.filterForm.reset({ search: '', projectId: '', status: '', priority: '', assignedToId: '' });
  }

  viewTicket(ticket: Ticket) {
    this.router.navigate(['/tickets', ticket.id]);
  }

  deleteTicket(ticket: Ticket) {
    if (confirm(`Delete ticket ${ticket.ticketNumber}?`)) {
      this.ticketApi.deleteTicket(ticket.id).subscribe({
        next: () => { this.toastr.success('Ticket deleted'); this.loadTickets(); },
        error: (e) => this.toastr.error(e.error?.message || 'Delete failed')
      });
    }
  }

  exportExcel() {
    const f = this.filterForm.value;
    this.ticketApi.exportExcel(f.status, f.priority).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'tickets.xlsx'; a.click();
    });
  }

  priorityLabel(p: string): string {
    return p.replace('P1_CRITICAL','P1').replace('P2_HIGH','P2').replace('P3_MEDIUM','P3').replace('P4_LOW','P4');
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isAdmin() { return this.authService.isAdmin(); }
  isAdminOrSupport() { return this.authService.isAdminOrSupport(); }
}
