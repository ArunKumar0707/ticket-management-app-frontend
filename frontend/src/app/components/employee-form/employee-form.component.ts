import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update employee information' : 'Add a new team member' }}</p>
        </div>
        <a routerLink="/employees" mat-button class="btn-ghost">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:60px">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="form-card animate-in">
          <form [formGroup]="form" (ngSubmit)="submit()">

            <p class="form-section-title">Personal Information</p>

            <div class="form-row" style="margin-bottom:16px">
              <mat-form-field>
                <mat-label>Full Name *</mat-label>
                <input matInput formControlName="employeeName" placeholder="e.g. Alice Johnson">
                @if (form.get('employeeName')?.invalid && form.get('employeeName')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field>
                <mat-label>Email Address *</mat-label>
                <input matInput type="email" formControlName="email" placeholder="alice@company.com">
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>Email is required</mat-error>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>Invalid email format</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row" style="margin-bottom:24px">
              <mat-form-field>
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber" placeholder="+1-555-0101">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="ACTIVE">Active</mat-option>
                  <mat-option value="INACTIVE">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <p class="form-section-title">Work Details</p>

            <div class="form-row" style="margin-bottom:24px">
              <mat-form-field>
                <mat-label>Department</mat-label>
                <mat-select formControlName="department">
                  <mat-option value="">None</mat-option>
                  @for (d of departments; track d) {
                    <mat-option [value]="d">{{ d }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Role / Job Title</mat-label>
                <input matInput formControlName="role" placeholder="e.g. Senior Developer">
              </mat-form-field>
            </div>

            <div class="form-actions">
              <a routerLink="/employees" mat-button class="btn-ghost">Cancel</a>
              <button mat-flat-button class="btn-primary" type="submit" [disabled]="submitting || form.invalid">
                @if (submitting) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
                {{ isEdit ? 'Update Employee' : 'Add Employee' }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  employeeId!: number;
  loading = false;
  submitting = false;

  departments = [
    'Engineering', 'Product', 'Design', 'QA',
    'DevOps', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeName: ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      phoneNumber:  [''],
      department:   [''],
      role:         [''],
      status:       ['ACTIVE']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.employeeId = +id;
      this.loading = true;
      this.employeeService.getById(this.employeeId).subscribe({
        next: e => {
          this.form.patchValue({
            employeeName: e.employeeName,
            email: e.email,
            phoneNumber: e.phoneNumber,
            department: e.department,
            role: e.role,
            status: e.status
          });
          this.loading = false;
        },
        error: () => { this.loading = false; this.snackBar.open('Failed to load employee', 'Dismiss'); }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const req = this.form.value;
    const obs = this.isEdit
      ? this.employeeService.update(this.employeeId, req)
      : this.employeeService.create(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Employee ${this.isEdit ? 'updated' : 'added'} successfully`, 'OK', { panelClass: 'toast-success' });
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || 'Operation failed. Please try again.';
        this.snackBar.open(msg, 'Dismiss', { panelClass: 'toast-error' });
      }
    });
  }
}
