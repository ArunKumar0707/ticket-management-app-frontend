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
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-form',
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
          <h1 class="page-title">{{ isEdit ? 'Edit Project' : 'New Project' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update project details' : 'Create a new project to organise tickets' }}</p>
        </div>
        <a routerLink="/projects" mat-button class="btn-ghost">
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

            <p class="form-section-title">Project Information</p>

            <div class="form-row single" style="margin-bottom:16px">
              <mat-form-field>
                <mat-label>Project Name *</mat-label>
                <input matInput formControlName="projectName" placeholder="e.g. Website Redesign">
                @if (form.get('projectName')?.invalid && form.get('projectName')?.touched) {
                  <mat-error>Project name is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row single" style="margin-bottom:16px">
              <mat-form-field>
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="projectDescription" rows="4"
                  placeholder="What is this project about?"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row" style="margin-bottom:24px">
              <mat-form-field>
                <mat-label>Status</mat-label>
                <mat-select formControlName="projectStatus">
                  <mat-option value="ACTIVE">Active</mat-option>
                  <mat-option value="IN_PROGRESS">In Progress</mat-option>
                  <mat-option value="ON_HOLD">On Hold</mat-option>
                  <mat-option value="COMPLETED">Completed</mat-option>
                  <mat-option value="CANCELLED">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Project Owner / Manager</mat-label>
                <input matInput formControlName="projectOwner" placeholder="e.g. Alice Johnson">
              </mat-form-field>
            </div>

            <div class="form-actions">
              <a routerLink="/projects" mat-button class="btn-ghost">Cancel</a>
              <button mat-flat-button class="btn-primary" type="submit" [disabled]="submitting || form.invalid">
                @if (submitting) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
                {{ isEdit ? 'Update Project' : 'Create Project' }}
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
export class ProjectFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  projectId!: number;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      projectName:        ['', Validators.required],
      projectDescription: [''],
      projectStatus:      ['ACTIVE'],
      projectOwner:       ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.projectId = +id;
      this.loading = true;
      this.projectService.getById(this.projectId).subscribe({
        next: p => {
          this.form.patchValue({
            projectName: p.projectName,
            projectDescription: p.projectDescription,
            projectStatus: p.projectStatus,
            projectOwner: p.projectOwner
          });
          this.loading = false;
        },
        error: () => { this.loading = false; this.snackBar.open('Failed to load project', 'Dismiss'); }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const req = this.form.value;
    const obs = this.isEdit
      ? this.projectService.update(this.projectId, req)
      : this.projectService.create(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Project ${this.isEdit ? 'updated' : 'created'} successfully`, 'OK', { panelClass: 'toast-success' });
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Operation failed. Please try again.', 'Dismiss', { panelClass: 'toast-error' });
      }
    });
  }
}
