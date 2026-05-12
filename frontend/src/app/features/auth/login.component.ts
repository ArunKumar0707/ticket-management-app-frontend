import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="brand">
          <mat-icon class="brand-icon">confirmation_number</mat-icon>
          <span>HelpDesk Pro</span>
        </div>
        <h1>Enterprise Ticket<br>Management System</h1>
        <p>Streamline support operations with intelligent ticket routing, SLA tracking, and real-time analytics.</p>
        <div class="feature-list">
          <div class="feature" *ngFor="let f of features">
            <mat-icon>{{ f.icon }}</mat-icon>
            <span>{{ f.label }}</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <div class="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter username" autocomplete="username">
              <mat-icon matPrefix>person_outline</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.errors?.['required']">Username is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <mat-icon matPrefix>lock_outline</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</mat-error>
            </mat-form-field>

            <button mat-raised-button type="submit" class="login-btn btn-primary" [disabled]="loading">
              <mat-spinner diameter="18" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </form>

          <div class="demo-creds">
            <p class="demo-label">Demo Credentials</p>
            <div class="cred-chips">
              <button class="cred-chip" *ngFor="let c of demoCredentials" (click)="fillCredentials(c)">
                <strong>{{ c.role }}</strong> · {{ c.username }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #0d1117 0%, #1a2744 50%, #0d1117 100%);
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%);
        top: -100px; right: -100px;
        border-radius: 50%;
      }
      &::after {
        content: '';
        position: absolute;
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
        bottom: -50px; left: 50px;
        border-radius: 50%;
      }

      .brand {
        display: flex; align-items: center; gap: 10px;
        font-size: 20px; font-weight: 700; color: var(--accent-light);
        margin-bottom: 48px;
        .brand-icon { font-size: 28px; width: 28px; height: 28px; }
      }

      h1 {
        font-size: 42px; font-weight: 800;
        color: var(--text-primary); line-height: 1.2;
        margin-bottom: 20px;
      }
      p { font-size: 16px; color: var(--text-secondary); line-height: 1.6; max-width: 400px; margin-bottom: 40px; }

      .feature-list { display: flex; flex-direction: column; gap: 14px; }
      .feature {
        display: flex; align-items: center; gap: 12px;
        color: var(--text-secondary); font-size: 14px;
        mat-icon { color: var(--accent-light); font-size: 20px; width: 20px; height: 20px; }
      }
    }

    .login-right {
      width: 480px;
      display: flex; align-items: center; justify-content: center;
      padding: 40px;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
    }

    .login-card {
      width: 100%;
      max-width: 380px;
    }

    .login-header {
      margin-bottom: 32px;
      h2 { font-size: 28px; font-weight: 700; color: var(--text-primary); }
      p { color: var(--text-secondary); margin-top: 6px; }
    }

    .login-form {
      display: flex; flex-direction: column; gap: 16px;
      .full-width { width: 100%; }
    }

    .login-btn {
      width: 100%;
      height: 48px;
      margin-top: 8px;
      font-size: 15px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    .demo-creds {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid var(--border);

      .demo-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
      .cred-chips { display: flex; flex-direction: column; gap: 8px; }
      .cred-chip {
        text-align: left;
        padding: 10px 14px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s;
        &:hover { border-color: var(--accent); color: var(--text-primary); background: var(--bg-hover); }
        strong { color: var(--accent-light); }
      }
    }

    @media (max-width: 768px) {
      .login-page { flex-direction: column; }
      .login-left { padding: 40px 24px; min-height: 200px; }
      .login-left h1 { font-size: 28px; }
      .login-right { width: 100%; padding: 24px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  features = [
    { icon: 'speed', label: 'Real-time SLA tracking and breach alerts' },
    { icon: 'analytics', label: 'Advanced analytics and reporting dashboard' },
    { icon: 'group', label: 'Role-based access control for teams' },
    { icon: 'notifications_active', label: 'Email notifications and escalations' }
  ];

  demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Support', username: 'john.doe', password: 'password123' },
    { role: 'Employee', username: 'alice.brown', password: 'password123' }
  ];

  constructor(private fb: FormBuilder, private authService: AuthService,
              private router: Router, private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  fillCredentials(cred: any) {
    this.loginForm.patchValue({ username: cred.username, password: cred.password });
  }

  onSubmit() {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (res) => {
        this.toastr.success(`Welcome back, ${res.data.fullName}!`, 'Login Successful');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || 'Invalid credentials', 'Login Failed');
      }
    });
  }
}
