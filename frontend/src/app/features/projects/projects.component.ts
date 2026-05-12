import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { ProjectApiService } from '../../core/services/api.service';
import { Project } from '../../shared/models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="projects-page">
      <div class="page-header">
        <div>
          <h1>Project Management</h1>
          <p class="subtitle">{{ projects.length }} projects configured</p>
        </div>
        <button mat-raised-button class="btn-primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Project
        </button>
      </div>

      <!-- Form Panel -->
      <div class="card form-panel" *ngIf="showForm">
        <div class="card-header">
          <span class="card-title">{{ editingProject ? 'Edit Project' : 'Create New Project' }}</span>
          <button mat-icon-button (click)="closeForm()"><mat-icon>close</mat-icon></button>
        </div>
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
          <div class="form-grid cols-2">
            <mat-form-field appearance="outline">
              <mat-label>Project Name *</mat-label>
              <input matInput formControlName="name" placeholder="e.g. HR Portal">
              <mat-error *ngIf="f['name'].errors?.['required']">Name is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Project Code *</mat-label>
              <input matInput formControlName="projectCode" placeholder="e.g. HRP" style="text-transform:uppercase">
              <mat-error *ngIf="f['projectCode'].errors?.['required']">Code is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2" placeholder="Brief description..."></textarea>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button type="submit" class="btn-primary" [disabled]="submitting">
              <mat-icon>save</mat-icon> {{ editingProject ? 'Update' : 'Create' }} Project
            </button>
            <button mat-stroked-button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Projects Grid -->
      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="36"></mat-spinner></div>

      <div class="projects-grid" *ngIf="!loading">
        <div class="project-card card" *ngFor="let p of projects">
          <div class="project-card-header">
            <div class="project-icon">{{ p.projectCode }}</div>
            <div class="project-actions">
              <button mat-icon-button (click)="editProject(p)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="deleteProject(p)" matTooltip="Delete" style="color:var(--danger-light)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
          <h3 class="project-name">{{ p.name }}</h3>
          <p class="project-desc">{{ p.description || 'No description' }}</p>
          <div class="project-footer">
            <div class="ticket-count">
              <mat-icon>confirmation_number</mat-icon>
              <span>{{ p.ticketCount || 0 }} tickets</span>
            </div>
            <span class="badge" [class]="p.isActive ? 'status-RESOLVED' : 'status-CLOSED'">
              {{ p.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="project-card card add-card" (click)="openForm()" *ngIf="!showForm">
          <mat-icon>add_circle_outline</mat-icon>
          <span>Add New Project</span>
        </div>
      </div>

      <div *ngIf="!loading && projects.length === 0 && !showForm" class="empty-state">
        <mat-icon>folder_off</mat-icon>
        <h3>No projects yet</h3>
        <p>Create your first project to get started</p>
      </div>
    </div>
  `,
  styles: [`
    .projects-page { max-width: 1200px; }
    .form-panel { margin-bottom: 24px; }
    .form-actions { display: flex; gap: 12px; margin-top: 16px;
      button { display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; }
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .project-card {
      display: flex; flex-direction: column; gap: 10px;
      transition: all 0.2s;
      &:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    }

    .project-card-header {
      display: flex; align-items: center; justify-content: space-between;
    }

    .project-icon {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; color: #fff;
      letter-spacing: 0.5px;
    }

    .project-actions { display: flex; gap: 0; margin-right: -8px; }

    .project-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .project-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; flex: 1; }

    .project-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 12px; border-top: 1px solid var(--border-light); margin-top: 4px;
    }

    .ticket-count {
      display: flex; align-items: center; gap: 6px;
      color: var(--text-muted); font-size: 12px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .add-card {
      border-style: dashed !important;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 8px; min-height: 160px; cursor: pointer;
      color: var(--text-muted);
      mat-icon { font-size: 36px; width: 36px; height: 36px; }
      span { font-size: 14px; }
      &:hover { border-color: var(--accent) !important; color: var(--accent-light); background: var(--accent-glow); }
    }
  `]
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  showForm = false;
  editingProject: Project | null = null;
  submitting = false;
  projectForm: FormGroup;

  constructor(
    private projectApi: ProjectApiService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      projectCode: ['', [Validators.required, Validators.maxLength(20)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit() { this.loadProjects(); }

  loadProjects() {
    this.loading = true;
    this.projectApi.getAllProjects().subscribe({
      next: r => { this.projects = r.data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm() {
    this.showForm = true;
    this.editingProject = null;
    this.projectForm.reset({ isActive: true });
  }

  editProject(p: Project) {
    this.editingProject = p;
    this.showForm = true;
    this.projectForm.patchValue({ name: p.name, projectCode: p.projectCode, description: p.description, isActive: p.isActive });
  }

  closeForm() { this.showForm = false; this.editingProject = null; }

  get f() { return this.projectForm.controls; }

  onSubmit() {
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    this.submitting = true;
    const obs = this.editingProject
      ? this.projectApi.updateProject(this.editingProject.id, this.projectForm.value)
      : this.projectApi.createProject(this.projectForm.value);

    obs.subscribe({
      next: () => {
        this.toastr.success(`Project ${this.editingProject ? 'updated' : 'created'}`);
        this.closeForm(); this.loadProjects(); this.submitting = false;
      },
      error: (e) => { this.toastr.error(e.error?.message || 'Operation failed'); this.submitting = false; }
    });
  }

  deleteProject(p: Project) {
    if (confirm(`Delete project "${p.name}"? This cannot be undone.`)) {
      this.projectApi.deleteProject(p.id).subscribe({
        next: () => { this.toastr.success('Project deleted'); this.loadProjects(); },
        error: (e) => this.toastr.error(e.error?.message || 'Delete failed')
      });
    }
  }
}
