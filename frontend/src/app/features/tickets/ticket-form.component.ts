import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { TicketApiService, ProjectApiService, UserApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket, Project, User, SupportLevel, Priority, TicketStatus } from '../../shared/models/models';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="ticket-form-page">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Edit Ticket' : 'Create New Ticket' }}</h1>
          <p class="subtitle" *ngIf="isEdit">{{ ticket?.ticketNumber }}</p>
        </div>
        <a mat-stroked-button routerLink="/tickets" class="btn-secondary">
          <mat-icon>arrow_back</mat-icon> Back to List
        </a>
      </div>

      <div class="form-layout">
        <!-- Left: Main Form -->
        <div class="form-main">
          <div class="card">
            <div class="card-header">
              <span class="card-title">Ticket Information</span>
              <span class="ticket-id-badge" *ngIf="isEdit">{{ ticket?.ticketNumber }}</span>
              <span class="ticket-id-badge new" *ngIf="!isEdit">Auto-generated</span>
            </div>

            <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()">
              <div class="form-grid cols-2">
                <!-- Project -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Project *</mat-label>
                  <mat-select formControlName="projectId">
                    <mat-option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>folder_open</mat-icon>
                  <mat-error *ngIf="f['projectId'].errors?.['required']">Project is required</mat-error>
                </mat-form-field>

                <!-- Assign To -->
                <mat-form-field appearance="outline" *ngIf="isAdminOrSupport()">
                  <mat-label>Assign To Engineer</mat-label>
                  <mat-select formControlName="assignedToId">
                    <mat-option value="">Unassigned</mat-option>
                    <mat-option *ngFor="let u of engineers" [value]="u.id">{{ u.fullName }}</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>person_outline</mat-icon>
                </mat-form-field>

                <!-- Support Level -->
                <mat-form-field appearance="outline">
                  <mat-label>Support Level *</mat-label>
                  <mat-select formControlName="supportLevel">
                    <mat-option value="L1">L1 – First Line Support</mat-option>
                    <mat-option value="L2">L2 – Second Line Support</mat-option>
                    <mat-option value="L3">L3 – Third Line Support</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>support_agent</mat-icon>
                  <mat-error *ngIf="f['supportLevel'].errors?.['required']">Support level is required</mat-error>
                </mat-form-field>

                <!-- Priority -->
                <mat-form-field appearance="outline">
                  <mat-label>Priority *</mat-label>
                  <mat-select formControlName="priority">
                    <mat-option value="P1_CRITICAL">🔴 P1 – Critical</mat-option>
                    <mat-option value="P2_HIGH">🟠 P2 – High</mat-option>
                    <mat-option value="P3_MEDIUM">🟡 P3 – Medium</mat-option>
                    <mat-option value="P4_LOW">🟢 P4 – Low</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>flag</mat-icon>
                  <mat-error *ngIf="f['priority'].errors?.['required']">Priority is required</mat-error>
                </mat-form-field>

                <!-- Status (edit only) -->
                <mat-form-field appearance="outline" *ngIf="isEdit && isAdminOrSupport()">
                  <mat-label>Current Status</mat-label>
                  <mat-select formControlName="currentStatus">
                    <mat-option value="OPEN">Open</mat-option>
                    <mat-option value="IN_PROGRESS">In Progress</mat-option>
                    <mat-option value="ON_HOLD">On Hold</mat-option>
                    <mat-option value="RESOLVED">Resolved</mat-option>
                    <mat-option value="CLOSED">Closed</mat-option>
                    <mat-option value="REOPENED">Reopened</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>info_outline</mat-icon>
                </mat-form-field>

                <!-- Issue Description -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Issue Description *</mat-label>
                  <textarea matInput formControlName="issueDescription" rows="5"
                    placeholder="Describe the issue in detail..."></textarea>
                  <mat-hint align="end">{{ f['issueDescription'].value?.length || 0 }}/5000</mat-hint>
                  <mat-error *ngIf="f['issueDescription'].errors?.['required']">Description is required</mat-error>
                  <mat-error *ngIf="f['issueDescription'].errors?.['minlength']">At least 10 characters required</mat-error>
                </mat-form-field>

                <!-- Resolution Details (shown when status is Resolved/Closed) -->
                <mat-form-field appearance="outline" class="full-width"
                  *ngIf="isEdit && requiresResolution()">
                  <mat-label>Resolution Details *</mat-label>
                  <textarea matInput formControlName="resolutionDetails" rows="4"
                    placeholder="Describe how the issue was resolved..."></textarea>
                  <mat-error *ngIf="f['resolutionDetails'].errors?.['required']">Resolution details are required</mat-error>
                </mat-form-field>

                <!-- Remarks -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Remarks / Additional Notes</mat-label>
                  <textarea matInput formControlName="remarks" rows="3"
                    placeholder="Any additional notes or context..."></textarea>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-raised-button type="submit" class="btn-primary" [disabled]="submitting">
                  <mat-spinner diameter="18" *ngIf="submitting"></mat-spinner>
                  <mat-icon *ngIf="!submitting">{{ isEdit ? 'save' : 'add_circle' }}</mat-icon>
                  <span>{{ isEdit ? 'Update Record' : 'Create Ticket' }}</span>
                </button>
                <button mat-stroked-button type="button" class="btn-secondary" (click)="resetForm()">
                  <mat-icon>refresh</mat-icon> Reset Preview
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right: Info Panel -->
        <div class="form-sidebar">
          <!-- Auto-filled fields -->
          <div class="card info-card">
            <div class="card-header"><span class="card-title">Auto-Populated Fields</span></div>
            <div class="info-rows">
              <div class="info-row">
                <span class="info-label">Ticket ID</span>
                <span class="info-value ticket-number">{{ isEdit ? ticket?.ticketNumber : 'INC-XXXX (Auto)' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Generation Date</span>
                <span class="info-value">{{ isEdit ? (ticket?.generationDateTime | date:'MMM d, y HH:mm') : (now | date:'MMM d, y HH:mm') }}</span>
              </div>
              <div class="info-row" *ngIf="ticket?.responseDateTime">
                <span class="info-label">Response Date</span>
                <span class="info-value">{{ ticket?.responseDateTime | date:'MMM d, y HH:mm' }}</span>
              </div>
              <div class="info-row" *ngIf="ticket?.resolutionTimeFormatted">
                <span class="info-label">Resolution Time</span>
                <span class="info-value success">{{ ticket?.resolutionTimeFormatted }}</span>
              </div>
              <div class="info-row" *ngIf="ticket?.slaDueDateTime">
                <span class="info-label">SLA Due</span>
                <span class="info-value" [class.sla-breached]="ticket?.slaBreached">
                  {{ ticket?.slaDueDateTime | date:'MMM d, HH:mm' }}
                  <span *ngIf="ticket?.slaBreached">⚠️ Breached</span>
                </span>
              </div>
              <div class="info-row" *ngIf="ticket?.createdByName">
                <span class="info-label">Created By</span>
                <span class="info-value">{{ ticket?.createdByName }}</span>
              </div>
            </div>
          </div>

          <!-- SLA Guide -->
          <div class="card info-card">
            <div class="card-header"><span class="card-title">SLA Guidelines</span></div>
            <div class="sla-guide">
              <div class="sla-row" *ngFor="let s of slaGuide">
                <span class="badge priority-{{s.priority}}">{{ s.label }}</span>
                <span class="sla-time">{{ s.sla }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ticket-form-page { max-width: 1200px; }

    .form-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: start;
    }

    .ticket-id-badge {
      font-family: monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent-light);
      background: rgba(37,99,235,0.1);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid rgba(37,99,235,0.2);
      &.new { color: var(--text-muted); background: var(--bg-tertiary); border-color: var(--border); }
    }

    .form-actions {
      display: flex; gap: 12px; margin-top: 8px; padding-top: 20px;
      border-top: 1px solid var(--border);
      button { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 20px; }
    }

    .info-card { margin-bottom: 16px; }

    .info-rows { display: flex; flex-direction: column; gap: 12px; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }
    .info-label { font-size: 12px; color: var(--text-muted); }
    .info-value { font-size: 13px; color: var(--text-primary); text-align: right; }
    .info-value.success { color: var(--success-light); }

    .sla-guide { display: flex; flex-direction: column; gap: 10px; }
    .sla-row { display: flex; align-items: center; justify-content: space-between; }
    .sla-time { font-size: 12px; color: var(--text-secondary); }

    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class TicketFormComponent implements OnInit {
  ticketForm: FormGroup;
  isEdit = false;
  ticketId: number | null = null;
  ticket: Ticket | null = null;
  projects: Project[] = [];
  engineers: User[] = [];
  submitting = false;
  now = new Date();

  slaGuide = [
    { priority: 'P1_CRITICAL', label: 'P1 Critical', sla: '4 hours' },
    { priority: 'P2_HIGH', label: 'P2 High', sla: '8 hours' },
    { priority: 'P3_MEDIUM', label: 'P3 Medium', sla: '24 hours' },
    { priority: 'P4_LOW', label: 'P4 Low', sla: '72 hours' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketApi: TicketApiService,
    private projectApi: ProjectApiService,
    private userApi: UserApiService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.ticketForm = this.fb.group({
      projectId: [null, Validators.required],
      assignedToId: [null],
      supportLevel: [null, Validators.required],
      priority: [null, Validators.required],
      currentStatus: ['OPEN'],
      issueDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
      resolutionDetails: [''],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.loadProjects();
    if (this.isAdminOrSupport()) this.loadEngineers();

    this.ticketId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.ticketId && this.router.url.includes('edit');

    if (this.isEdit && this.ticketId) {
      this.ticketApi.getTicketById(this.ticketId).subscribe(res => {
        this.ticket = res.data;
        this.ticketForm.patchValue({
          projectId: res.data.projectId,
          assignedToId: res.data.assignedToId,
          supportLevel: res.data.supportLevel,
          priority: res.data.priority,
          currentStatus: res.data.currentStatus,
          issueDescription: res.data.issueDescription,
          resolutionDetails: res.data.resolutionDetails,
          remarks: res.data.remarks
        });
      });
    }

    // Dynamic validation for resolution details
    this.ticketForm.get('currentStatus')?.valueChanges.subscribe(status => {
      const ctrl = this.ticketForm.get('resolutionDetails');
      if (status === 'RESOLVED' || status === 'CLOSED') {
        ctrl?.setValidators(Validators.required);
      } else {
        ctrl?.clearValidators();
      }
      ctrl?.updateValueAndValidity();
    });
  }

  loadProjects() {
    this.projectApi.getActiveProjects().subscribe(res => this.projects = res.data);
  }

  loadEngineers() {
    this.userApi.getSupportEngineers().subscribe(res => this.engineers = res.data);
  }

  requiresResolution(): boolean {
    const s = this.ticketForm.get('currentStatus')?.value;
    return s === 'RESOLVED' || s === 'CLOSED';
  }

  get f() { return this.ticketForm.controls; }

  onSubmit() {
    if (this.ticketForm.invalid) { this.ticketForm.markAllAsTouched(); return; }
    this.submitting = true;
    const request = this.ticketForm.value;

    const obs = this.isEdit && this.ticketId
      ? this.ticketApi.updateTicket(this.ticketId, request)
      : this.ticketApi.createTicket(request);

    obs.subscribe({
      next: (res) => {
        this.toastr.success(this.isEdit ? 'Ticket updated successfully' : `Ticket ${res.data.ticketNumber} created!`);
        this.router.navigate(['/tickets', res.data.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err.error?.message || 'Operation failed');
      }
    });
  }

  resetForm() {
    if (this.isEdit && this.ticket) {
      this.ticketForm.patchValue({
        issueDescription: this.ticket.issueDescription,
        remarks: this.ticket.remarks
      });
    } else {
      this.ticketForm.reset({ currentStatus: 'OPEN' });
    }
    this.toastr.info('Form reset');
  }

  isAdminOrSupport() { return this.authService.isAdminOrSupport(); }
}
