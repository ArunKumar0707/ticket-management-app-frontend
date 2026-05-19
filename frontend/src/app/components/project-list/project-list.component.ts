import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatIconModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">{{ dataSource.filteredData.length }} projects</p>
        </div>
        <a routerLink="/projects/new" mat-flat-button class="btn-primary">
          <mat-icon>add</mat-icon> New Project
        </a>
      </div>

      <!-- Summary Cards -->
      <div class="proj-stats animate-in">
        @for (s of summaryCards; track s.label) {
          <div class="proj-stat-card" [style.border-left]="'3px solid ' + s.color">
            <div class="proj-stat-value" [style.color]="s.color">{{ s.value }}</div>
            <div class="proj-stat-label">{{ s.label }}</div>
          </div>
        }
      </div>

      <div class="data-table-wrapper animate-in">
        <div class="table-toolbar">
          <mat-form-field class="search-field" style="max-width:280px;margin:0">
            <mat-icon matPrefix style="color:var(--text-muted);margin-right:6px">search</mat-icon>
            <input matInput placeholder="Search projects…" [(ngModel)]="searchText" (ngModelChange)="applyFilter()">
            @if (searchText) {
              <button matSuffix mat-icon-button (click)="searchText='';applyFilter()"><mat-icon>close</mat-icon></button>
            }
          </mat-form-field>

          <mat-form-field style="width:150px;margin:0">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="IN_PROGRESS">In Progress</mat-option>
              <mat-option value="ON_HOLD">On Hold</mat-option>
              <mat-option value="COMPLETED">Completed</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading) {
          <div style="display:flex;align-items:center;justify-content:center;padding:60px">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>#</th>
              <td mat-cell *matCellDef="let p"><span class="mono-id">#{{ p.id }}</span></td>
            </ng-container>

            <ng-container matColumnDef="projectName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Project Name</th>
              <td mat-cell *matCellDef="let p">
                <div class="proj-name">{{ p.projectName }}</div>
                <div class="proj-desc">{{ p.projectDescription | slice:0:60 }}{{ p.projectDescription?.length > 60 ? '…' : '' }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="projectStatus">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="badge" [class]="'badge-' + p.projectStatus.toLowerCase()">
                  {{ p.projectStatus.replace('_',' ') }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="projectOwner">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Owner</th>
              <td mat-cell *matCellDef="let p">
                <div class="owner-cell">
                  <div class="owner-avatar">{{ initials(p.projectOwner) }}</div>
                  <span>{{ p.projectOwner || '—' }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="ticketCount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tickets</th>
              <td mat-cell *matCellDef="let p">
                <span class="ticket-count">{{ p.ticketCount }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let p">
                <span style="color:var(--text-muted);font-size:12px">{{ p.createdAt | date:'MMM d, y' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <div class="action-cell">
                  <a [routerLink]="['/projects/edit', p.id]" mat-icon-button matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button matTooltip="Delete" (click)="confirmDelete(p)" style="color:var(--danger)">
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
                  <mat-icon>folder_off</mat-icon>
                  <h3>No projects found</h3>
                  <p>Try adjusting your search or create a new project</p>
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
    .proj-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }
    .proj-stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px 20px;
    }
    .proj-stat-value { font-size: 24px; font-weight: 800; }
    .proj-stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .proj-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .proj-desc { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .owner-cell { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .owner-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--accent-light); color: var(--accent);
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .ticket-count {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 28px; height: 22px; padding: 0 8px;
      background: var(--bg-surface-2); border: 1px solid var(--border);
      border-radius: 99px; font-size: 12px; font-weight: 600; color: var(--text-secondary);
    }
    .mono-id { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-muted); }
    .action-cell { display: flex; align-items: center; gap: 2px; opacity: 0; transition: opacity 150ms; }
    tr:hover .action-cell { opacity: 1; }
    @media (max-width: 900px) { .proj-stats { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class ProjectListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['id', 'projectName', 'projectStatus', 'projectOwner', 'ticketCount', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Project>([]);
  loading = true;
  searchText = '';
  filterStatus = '';
  summaryCards: { label: string; value: number; color: string }[] = [];

  constructor(private projectService: ProjectService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: projects => {
        this.dataSource.data = projects;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (p: Project, f: string) => {
          const fv = JSON.parse(f);
          const matchText = !fv.text || p.projectName.toLowerCase().includes(fv.text) || (p.projectOwner || '').toLowerCase().includes(fv.text);
          const matchStatus = !fv.status || p.projectStatus === fv.status;
          return matchText && matchStatus;
        };
        this.buildSummary(projects);
        this.loading = false;
      },
      error: () => { this.loading = false; this.snackBar.open('Failed to load projects', 'Dismiss'); }
    });
  }

  buildSummary(projects: Project[]): void {
    const total = projects.length;
    const active = projects.filter(p => p.projectStatus === 'ACTIVE').length;
    const inProg = projects.filter(p => p.projectStatus === 'IN_PROGRESS').length;
    const onHold = projects.filter(p => p.projectStatus === 'ON_HOLD').length;
    this.summaryCards = [
      { label: 'Total', value: total, color: 'var(--accent)' },
      { label: 'Active', value: active, color: 'var(--success)' },
      { label: 'In Progress', value: inProg, color: 'var(--warning)' },
      { label: 'On Hold', value: onHold, color: 'var(--text-muted)' }
    ];
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ text: this.searchText.toLowerCase(), status: this.filterStatus });
    this.dataSource.paginator?.firstPage();
  }

  initials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  confirmDelete(p: Project): void {
    if (!confirm(`Delete project "${p.projectName}"? This will unlink all associated tickets.`)) return;
    this.projectService.delete(p.id).subscribe({
      next: () => { this.snackBar.open('Project deleted', 'OK', { panelClass: 'toast-success' }); this.load(); },
      error: () => this.snackBar.open('Delete failed', 'Dismiss', { panelClass: 'toast-error' })
    });
  }
}
