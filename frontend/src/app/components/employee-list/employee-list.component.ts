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
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/models';

@Component({
  selector: 'app-employee-list',
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
          <h1 class="page-title">Employees</h1>
          <p class="page-subtitle">{{ dataSource.filteredData.length }} members</p>
        </div>
        <a routerLink="/employees/new" mat-flat-button class="btn-primary">
          <mat-icon>person_add</mat-icon> Add Employee
        </a>
      </div>

      <!-- Department filter chips -->
      <div class="dept-chips animate-in">
        <button class="dept-chip" [class.active]="!filterDept" (click)="filterDept='';applyFilter()">All</button>
        @for (d of departments; track d) {
          <button class="dept-chip" [class.active]="filterDept===d" (click)="filterDept=d;applyFilter()">{{ d }}</button>
        }
      </div>

      <div class="data-table-wrapper animate-in">
        <div class="table-toolbar">
          <mat-form-field class="search-field" style="max-width:280px;margin:0">
            <mat-icon matPrefix style="color:var(--text-muted);margin-right:6px">search</mat-icon>
            <input matInput placeholder="Search by name or email…" [(ngModel)]="searchText" (ngModelChange)="applyFilter()">
            @if (searchText) {
              <button matSuffix mat-icon-button (click)="searchText='';applyFilter()"><mat-icon>close</mat-icon></button>
            }
          </mat-form-field>

          <mat-form-field style="width:130px;margin:0">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="INACTIVE">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading) {
          <div style="display:flex;align-items:center;justify-content:center;padding:60px">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>

            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
              <td mat-cell *matCellDef="let e">
                <div class="emp-cell">
                  <div class="emp-avatar">{{ initials(e.employeeName) }}</div>
                  <div>
                    <div class="emp-name">{{ e.employeeName }}</div>
                    <div class="emp-email">{{ e.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let e">
                <span style="font-size:13px;color:var(--text-secondary)">{{ e.role || '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
              <td mat-cell *matCellDef="let e">
                @if (e.department) {
                  <span class="dept-badge">{{ e.department }}</span>
                } @else { <span style="color:var(--text-muted)">—</span> }
              </td>
            </ng-container>

            <ng-container matColumnDef="phoneNumber">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let e">
                <span style="font-size:12px;color:var(--text-muted);font-family:'JetBrains Mono',monospace">{{ e.phoneNumber || '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="badge" [class]="'badge-' + e.status.toLowerCase()">{{ e.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="assignedTicketCount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tickets</th>
              <td mat-cell *matCellDef="let e">
                <span class="ticket-count">{{ e.assignedTicketCount }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                <div class="action-cell">
                  <a [routerLink]="['/employees/edit', e.id]" mat-icon-button matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button matTooltip="Delete" (click)="confirmDelete(e)" style="color:var(--danger)">
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
                  <mat-icon>group_off</mat-icon>
                  <h3>No employees found</h3>
                  <p>Try adjusting your filters or add a new employee</p>
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
    .dept-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .dept-chip {
      padding: 5px 14px;
      border-radius: 99px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
    }
    .dept-chip:hover { border-color: var(--accent); color: var(--accent); }
    .dept-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }

    .emp-cell { display: flex; align-items: center; gap: 10px; }
    .emp-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .emp-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .emp-email { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

    .dept-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 99px;
      background: var(--accent-light);
      color: var(--accent);
      font-size: 11px;
      font-weight: 600;
    }

    .ticket-count {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 20px; padding: 0 8px;
      background: var(--bg-surface-2); border: 1px solid var(--border);
      border-radius: 99px; font-size: 12px; font-weight: 600; color: var(--text-secondary);
    }

    .action-cell { display: flex; align-items: center; gap: 2px; opacity: 0; transition: opacity 150ms; }
    tr:hover .action-cell { opacity: 1; }
  `]
})
export class EmployeeListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['employeeName', 'role', 'department', 'phoneNumber', 'status', 'assignedTicketCount', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  loading = true;
  searchText = '';
  filterStatus = '';
  filterDept = '';
  departments: string[] = [];

  constructor(private employeeService: EmployeeService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: employees => {
        this.dataSource.data = employees;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.departments = [...new Set(employees.map(e => e.department).filter(Boolean))].sort();
        this.dataSource.filterPredicate = (e: Employee, f: string) => {
          const fv = JSON.parse(f);
          const matchText = !fv.text || e.employeeName.toLowerCase().includes(fv.text) || e.email.toLowerCase().includes(fv.text);
          const matchStatus = !fv.status || e.status === fv.status;
          const matchDept = !fv.dept || e.department === fv.dept;
          return matchText && matchStatus && matchDept;
        };
        this.loading = false;
      },
      error: () => { this.loading = false; this.snackBar.open('Failed to load employees', 'Dismiss'); }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ text: this.searchText.toLowerCase(), status: this.filterStatus, dept: this.filterDept });
    this.dataSource.paginator?.firstPage();
  }

  initials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  confirmDelete(e: Employee): void {
    if (!confirm(`Delete employee "${e.employeeName}"?`)) return;
    this.employeeService.delete(e.id).subscribe({
      next: () => { this.snackBar.open('Employee deleted', 'OK', { panelClass: 'toast-success' }); this.load(); },
      error: () => this.snackBar.open('Delete failed', 'Dismiss', { panelClass: 'toast-error' })
    });
  }
}
