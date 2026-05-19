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
import { TicketService } from '../../services/ticket.service';
import { ProjectService } from '../../services/project.service';
import { EmployeeService } from '../../services/employee.service';
import { Project, Employee } from '../../models/models';

@Component({
  selector: 'app-ticket-form',
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
          <h1 class="page-title">{{ isEdit ? 'Edit Ticket' : 'New Ticket' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update ticket details' : 'Create a new support ticket' }}</p>
        </div>
        <a routerLink="/tickets" mat-button class="btn-ghost">
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

            <p class="form-section-title">Ticket Information</p>

            <div class="form-row single" style="margin-bottom:16px">
              <mat-form-field>
                <mat-label>Title *</mat-label>
                <input matInput formControlName="title" placeholder="Brief summary of the issue">
                @if (form.get('title')?.invalid && form.get('title')?.touched) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row single" style="margin-bottom:16px">
              <mat-form-field>
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="5"
                  placeholder="Detailed description of the ticket…"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row" style="margin-bottom:24px">
              <mat-form-field>
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="OPEN">Open</mat-option>
                  <mat-option value="IN_PROGRESS">In Progress</mat-option>
                  <mat-option value="RESOLVED">Resolved</mat-option>
                  <mat-option value="CLOSED">Closed</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="LOW">Low</mat-option>
                  <mat-option value="MEDIUM">Medium</mat-option>
                  <mat-option value="HIGH">High</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <p class="form-section-title">Assignment</p>

            <div class="form-row" style="margin-bottom:24px">
              <mat-form-field>
                <mat-label>Project</mat-label>
                <mat-select formControlName="projectId">
                  <mat-option [value]="null">None</mat-option>
                  @for (p of projects; track p.id) {
                    <mat-option [value]="p.id">{{ p.projectName }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Assignee</mat-label>
                <mat-select formControlName="assigneeId">
                  <mat-option [value]="null">Unassigned</mat-option>
                  @for (e of employees; track e.id) {
                    <mat-option [value]="e.id">{{ e.employeeName }} — {{ e.role }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <a routerLink="/tickets" mat-button class="btn-ghost">Cancel</a>
              <button mat-flat-button class="btn-primary" type="submit" [disabled]="submitting || form.invalid">
                @if (submitting) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
                {{ isEdit ? 'Update Ticket' : 'Create Ticket' }}
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
export class TicketFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  ticketId!: number;
  loading = false;
  submitting = false;
  projects: Project[] = [];
  employees: Employee[] = [];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title:       ['', Validators.required],
      description: [''],
      status:      ['OPEN'],
      priority:    ['MEDIUM'],
      projectId:   [null],
      assigneeId:  [null]
    });

    this.projectService.getAll().subscribe(p => this.projects = p);
    this.employeeService.getAll().subscribe(e => this.employees = e.filter(em => em.status === 'ACTIVE'));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.ticketId = +id;
      this.loading = true;
      this.ticketService.getById(this.ticketId).subscribe({
        next: t => {
          this.form.patchValue({
            title: t.title, description: t.description,
            status: t.status, priority: t.priority,
            projectId: t.projectId ?? null, assigneeId: t.assigneeId ?? null
          });
          this.loading = false;
        },
        error: () => { this.loading = false; this.snackBar.open('Failed to load ticket', 'Dismiss'); }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const req = this.form.value;
    const obs = this.isEdit
      ? this.ticketService.update(this.ticketId, req)
      : this.ticketService.create(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Ticket ${this.isEdit ? 'updated' : 'created'} successfully`, 'OK', { panelClass: 'toast-success' });
        this.router.navigate(['/tickets']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Operation failed. Please try again.', 'Dismiss', { panelClass: 'toast-error' });
      }
    });
  }
}
