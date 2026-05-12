import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { UserApiService } from '../../core/services/api.service';
import { User, Role } from '../../shared/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="users-page">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p class="subtitle">{{ users.length }} users registered</p>
        </div>
        <button mat-raised-button class="btn-primary" (click)="openForm()">
          <mat-icon>person_add</mat-icon> Add User
        </button>
      </div>

      <!-- User Form Panel -->
      <div class="card form-panel" *ngIf="showForm">
        <div class="card-header">
          <span class="card-title">{{ editingUser ? 'Edit User' : 'Create New User' }}</span>
          <button mat-icon-button (click)="closeForm()"><mat-icon>close</mat-icon></button>
        </div>
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-grid cols-2">
            <mat-form-field appearance="outline">
              <mat-label>Full Name *</mat-label>
              <input matInput formControlName="fullName">
              <mat-error *ngIf="f['fullName'].errors?.['required']">Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Username *</mat-label>
              <input matInput formControlName="username">
              <mat-error *ngIf="f['username'].errors?.['required']">Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email *</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-error *ngIf="f['email'].errors?.['required']">Required</mat-error>
              <mat-error *ngIf="f['email'].errors?.['email']">Invalid email</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password {{ editingUser ? '(leave blank to keep)' : '*' }}</mat-label>
              <input matInput formControlName="password" type="password">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Role *</mat-label>
              <mat-select formControlName="role">
                <mat-option value="ADMIN">Admin</mat-option>
                <mat-option value="SUPPORT_ENGINEER">Support Engineer</mat-option>
                <mat-option value="EMPLOYEE">Employee</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <input matInput formControlName="department">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button type="submit" class="btn-primary" [disabled]="submitting">
              <mat-icon>save</mat-icon> {{ editingUser ? 'Update' : 'Create' }} User
            </button>
            <button mat-stroked-button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Users Table -->
      <div class="data-table-container">
        <div *ngIf="loading" class="loading-overlay" style="padding:40px"><mat-spinner diameter="36"></mat-spinner></div>
        <table mat-table [dataSource]="users" *ngIf="!loading">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let u">
              <div class="user-cell">
                <div class="user-avatar-sm">{{ initials(u.fullName) }}</div>
                <div>
                  <div class="user-name">{{ u.fullName }}</div>
                  <div class="user-email">{{ u.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let u" class="ticket-number">{{ u.username }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let u">
              <span class="role-badge" [class]="'role-'+u.role">{{ u.role.replace('_',' ') | titlecase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let u" class="text-muted">{{ u.department || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let u">
              <span class="badge" [class]="u.isActive ? 'status-OPEN' : 'status-CLOSED'">
                {{ u.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button (click)="editUser(u)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="toggleStatus(u)" [matTooltip]="u.isActive ? 'Deactivate' : 'Activate'">
                <mat-icon>{{ u.isActive ? 'person_off' : 'person' }}</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteUser(u)" matTooltip="Delete" style="color:var(--danger-light)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-page { max-width: 1200px; }
    .form-panel { margin-bottom: 24px; }
    .form-actions { display: flex; gap: 12px; margin-top: 16px; button { display:flex;align-items:center;gap:6px;height:40px;padding:0 16px; } }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
    .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .user-email { font-size: 11px; color: var(--text-muted); }

    .role-badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      &.role-ADMIN { background: rgba(220,38,38,0.15); color: #f87171; border: 1px solid rgba(220,38,38,0.3); }
      &.role-SUPPORT_ENGINEER { background: rgba(37,99,235,0.15); color: #60a5fa; border: 1px solid rgba(37,99,235,0.3); }
      &.role-EMPLOYEE { background: rgba(22,163,74,0.15); color: #4ade80; border: 1px solid rgba(22,163,74,0.3); }
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  showForm = false;
  editingUser: User | null = null;
  submitting = false;
  userForm: FormGroup;
  displayedColumns = ['name', 'username', 'role', 'department', 'status', 'actions'];

  constructor(private userApi: UserApiService, private fb: FormBuilder, private toastr: ToastrService) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['EMPLOYEE', Validators.required],
      department: [''],
      phone: ['']
    });
  }

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading = true;
    this.userApi.getAllUsers().subscribe({ next: r => { this.users = r.data; this.loading = false; }, error: () => this.loading = false });
  }

  openForm() { this.showForm = true; this.editingUser = null; this.userForm.reset({ role: 'EMPLOYEE' }); this.userForm.get('password')?.setValidators(Validators.required); }

  editUser(u: User) {
    this.editingUser = u;
    this.showForm = true;
    this.userForm.patchValue({ fullName: u.fullName, username: u.username, email: u.email, role: u.role, department: u.department, phone: u.phone });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeForm() { this.showForm = false; this.editingUser = null; }

  get f() { return this.userForm.controls; }

  onSubmit() {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.submitting = true;
    const obs = this.editingUser
      ? this.userApi.updateUser(this.editingUser.id, this.userForm.value)
      : this.userApi.createUser(this.userForm.value);
    obs.subscribe({
      next: () => { this.toastr.success(`User ${this.editingUser ? 'updated' : 'created'}`); this.closeForm(); this.loadUsers(); this.submitting = false; },
      error: (e) => { this.toastr.error(e.error?.message || 'Operation failed'); this.submitting = false; }
    });
  }

  toggleStatus(u: User) {
    this.userApi.toggleUserStatus(u.id).subscribe({ next: () => { this.toastr.success('Status updated'); this.loadUsers(); } });
  }

  deleteUser(u: User) {
    if (confirm(`Delete user ${u.fullName}?`)) {
      this.userApi.deleteUser(u.id).subscribe({ next: () => { this.toastr.success('User deleted'); this.loadUsers(); } });
    }
  }

  initials(name: string) { return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?'; }
}
