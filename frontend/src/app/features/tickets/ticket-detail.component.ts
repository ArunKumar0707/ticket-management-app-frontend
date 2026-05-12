import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { TicketApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket } from '../../shared/models/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatTabsModule, MatTooltipModule
  ],
  template: `
    <div class="ticket-detail-page" *ngIf="ticket">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-left">
          <a routerLink="/tickets" class="back-link">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <div class="ticket-meta">
              <span class="ticket-number">{{ ticket.ticketNumber }}</span>
              <span class="badge status-{{ ticket.currentStatus }}">{{ ticket.currentStatus | titlecase }}</span>
              <span class="badge priority-{{ ticket.priority }}">{{ priorityLabel(ticket.priority) }}</span>
              <span class="badge level-{{ ticket.supportLevel }}">{{ ticket.supportLevel }}</span>
              <span class="sla-badge danger" *ngIf="ticket.slaBreached">⚠️ SLA Breached</span>
            </div>
            <h1>{{ ticket.projectName }}</h1>
          </div>
        </div>
        <div class="header-actions" *ngIf="isAdminOrSupport()">
          <mat-form-field appearance="outline" class="status-select">
            <mat-label>Update Status</mat-label>
            <mat-select [formControl]="statusControl" (selectionChange)="onStatusChange($event.value)">
              <mat-option value="OPEN">Open</mat-option>
              <mat-option value="IN_PROGRESS">In Progress</mat-option>
              <mat-option value="ON_HOLD">On Hold</mat-option>
              <mat-option value="RESOLVED">Resolved</mat-option>
              <mat-option value="CLOSED">Closed</mat-option>
              <mat-option value="REOPENED">Reopened</mat-option>
            </mat-select>
          </mat-form-field>
          <a mat-stroked-button [routerLink]="['/tickets', ticket.id, 'edit']" class="btn-secondary">
            <mat-icon>edit</mat-icon> Edit
          </a>
        </div>
      </div>

      <div class="detail-layout">
        <!-- Left: Main Content -->
        <div class="detail-main">
          <!-- Description -->
          <div class="card mb-4">
            <div class="card-header"><span class="card-title">Issue Description</span></div>
            <p class="issue-text">{{ ticket.issueDescription }}</p>
          </div>

          <!-- Resolution (if exists) -->
          <div class="card mb-4" *ngIf="ticket.resolutionDetails">
            <div class="card-header"><span class="card-title">Resolution Details</span></div>
            <p class="issue-text resolution">{{ ticket.resolutionDetails }}</p>
          </div>

          <!-- Tabs: Comments, History, Attachments -->
          <mat-tab-group class="detail-tabs" animationDuration="200ms">
            <!-- Comments Tab -->
            <mat-tab label="Comments ({{ ticket.comments?.length || 0 }})">
              <div class="tab-content">
                <div class="comments-list">
                  <div class="comment" *ngFor="let c of ticket.comments">
                    <div class="comment-avatar">{{ initials(c.authorName) }}</div>
                    <div class="comment-body">
                      <div class="comment-header">
                        <strong>{{ c.authorName }}</strong>
                        <span class="comment-role">{{ c.authorRole | titlecase }}</span>
                        <span class="comment-time">{{ c.createdAt | date:'MMM d, HH:mm' }}</span>
                        <span class="internal-badge" *ngIf="c.isInternal">Internal</span>
                      </div>
                      <p class="comment-text">{{ c.content }}</p>
                    </div>
                  </div>
                  <div class="empty-state" *ngIf="!ticket.comments?.length" style="padding:24px">
                    <mat-icon>chat_bubble_outline</mat-icon>
                    <p>No comments yet</p>
                  </div>
                </div>

                <!-- Add comment -->
                <div class="add-comment">
                  <div class="comment-input-avatar">{{ userInitials() }}</div>
                  <div class="comment-input-wrap">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Add a comment...</mat-label>
                      <textarea matInput [formControl]="commentControl" rows="3"></textarea>
                    </mat-form-field>
                    <div class="comment-actions">
                      <label class="internal-toggle" *ngIf="isAdminOrSupport()">
                        <input type="checkbox" [(ngModel)]="isInternalComment"> Internal note
                      </label>
                      <button mat-raised-button class="btn-primary" (click)="submitComment()"
                              [disabled]="!commentControl.value?.trim()">
                        <mat-icon>send</mat-icon> Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- History Tab -->
            <mat-tab label="History ({{ ticket.history?.length || 0 }})">
              <div class="tab-content">
                <div class="timeline">
                  <div class="timeline-item" *ngFor="let h of ticket.history">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <p class="timeline-desc">{{ h.description }}</p>
                      <div class="timeline-change" *ngIf="h.oldValue && h.newValue">
                        <span class="old-val">{{ h.oldValue }}</span>
                        <mat-icon style="font-size:14px;width:14px;height:14px">arrow_forward</mat-icon>
                        <span class="new-val">{{ h.newValue }}</span>
                      </div>
                      <div class="timeline-meta">
                        <span>{{ h.changedByName }}</span>
                        <span>·</span>
                        <span>{{ h.changedAt | date:'MMM d, HH:mm' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="empty-state" *ngIf="!ticket.history?.length" style="padding:24px">
                    <mat-icon>history</mat-icon>
                    <p>No history yet</p>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Attachments Tab -->
            <mat-tab label="Attachments ({{ ticket.attachments?.length || 0 }})">
              <div class="tab-content">
                <div class="attachments-grid">
                  <div class="attachment-item" *ngFor="let a of ticket.attachments">
                    <mat-icon class="file-icon">insert_drive_file</mat-icon>
                    <div class="file-info">
                      <span class="file-name">{{ a.fileName }}</span>
                      <span class="file-size">{{ formatSize(a.fileSize) }}</span>
                    </div>
                    <a [href]="a.downloadUrl" mat-icon-button matTooltip="Download">
                      <mat-icon>download</mat-icon>
                    </a>
                  </div>
                </div>

                <div class="upload-area" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                  <input type="file" id="fileInput" (change)="onFileSelect($event)" hidden multiple>
                  <label for="fileInput" class="upload-label">
                    <mat-icon>cloud_upload</mat-icon>
                    <span>Click to upload or drag & drop files here</span>
                    <small>Max 10MB per file</small>
                  </label>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>

        <!-- Right: Details Sidebar -->
        <div class="detail-sidebar">
          <div class="card">
            <div class="card-header"><span class="card-title">Ticket Details</span></div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Project</span>
                <span class="detail-value">{{ ticket.projectName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created By</span>
                <span class="detail-value">{{ ticket.createdByName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Assigned To</span>
                <span class="detail-value" [class.text-muted]="!ticket.assignedToName">
                  {{ ticket.assignedToName || 'Unassigned' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Generated</span>
                <span class="detail-value">{{ ticket.generationDateTime | date:'MMM d, y HH:mm' }}</span>
              </div>
              <div class="detail-item" *ngIf="ticket.responseDateTime">
                <span class="detail-label">Response</span>
                <span class="detail-value">{{ ticket.responseDateTime | date:'MMM d, y HH:mm' }}</span>
              </div>
              <div class="detail-item" *ngIf="ticket.resolutionDateTime">
                <span class="detail-label">Resolved At</span>
                <span class="detail-value" style="color:var(--success-light)">{{ ticket.resolutionDateTime | date:'MMM d, y HH:mm' }}</span>
              </div>
              <div class="detail-item" *ngIf="ticket.resolutionTimeFormatted">
                <span class="detail-label">Resolution Time</span>
                <span class="detail-value" style="color:var(--success-light)">{{ ticket.resolutionTimeFormatted }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">SLA Due</span>
                <span class="detail-value" [class.sla-breached]="ticket.slaBreached">
                  {{ ticket.slaDueDateTime | date:'MMM d, HH:mm' }}
                </span>
              </div>
              <div class="detail-item" *ngIf="ticket.remarks">
                <span class="detail-label">Remarks</span>
                <span class="detail-value">{{ ticket.remarks }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-overlay">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
  `,
  styles: [`
    .ticket-detail-page { max-width: 1200px; }

    .detail-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
      .header-left { display: flex; align-items: flex-start; gap: 16px; }
      .back-link { color: var(--text-secondary); display: flex; align-items: center; margin-top: 4px; text-decoration: none; &:hover { color: var(--text-primary); } }
      .ticket-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
      h1 { font-size: 18px; font-weight: 600; color: var(--text-primary); }
      .header-actions { display: flex; align-items: center; gap: 12px; }
    }

    .sla-badge.danger {
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
      background: rgba(220,38,38,0.15); color: var(--danger-light);
      border: 1px solid rgba(220,38,38,0.3);
    }

    .status-select { min-width: 180px; }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 20px; align-items: start;
    }

    .issue-text { color: var(--text-secondary); line-height: 1.7; font-size: 14px; }
    .issue-text.resolution { color: var(--success-light); }

    .detail-tabs {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;

      ::ng-deep .mat-mdc-tab-header { background: var(--bg-tertiary); border-bottom: 1px solid var(--border); }
      ::ng-deep .mat-mdc-tab { color: var(--text-secondary) !important; }
      ::ng-deep .mat-mdc-tab.mdc-tab--active { color: var(--accent-light) !important; }
      ::ng-deep .mdc-tab-indicator__content--underline { border-color: var(--accent-light) !important; }
      ::ng-deep .mat-mdc-tab-body-wrapper { background: var(--bg-card); }
    }

    .tab-content { padding: 20px; }

    .comments-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
    .comment {
      display: flex; gap: 12px;
      .comment-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
      .comment-body { flex: 1; }
      .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
      .comment-role { font-size: 11px; color: var(--text-muted); }
      .comment-time { font-size: 11px; color: var(--text-muted); margin-left: auto; }
      .comment-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
      .internal-badge { font-size: 10px; padding: 1px 6px; background: rgba(124,58,237,0.15); color: #a78bfa; border-radius: 10px; }
    }

    .add-comment { display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border); }
    .comment-input-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; margin-top: 8px; }
    .comment-input-wrap { flex: 1; }
    .comment-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .internal-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); cursor: pointer; }

    .timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-item { display: flex; gap: 12px; position: relative; padding-bottom: 16px;
      &:last-child { padding-bottom: 0; }
      &::before { content: ''; position: absolute; left: 5px; top: 18px; bottom: 0; width: 1px; background: var(--border); }
      &:last-child::before { display: none; }
    }
    .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 4px; }
    .timeline-content { flex: 1; }
    .timeline-desc { font-size: 13px; color: var(--text-primary); margin-bottom: 4px; }
    .timeline-change { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 12px; }
    .old-val { color: var(--danger-light); text-decoration: line-through; }
    .new-val { color: var(--success-light); }
    .timeline-meta { font-size: 11px; color: var(--text-muted); display: flex; gap: 4px; }

    .attachments-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .attachment-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: var(--radius-md);
      .file-icon { color: var(--accent-light); }
      .file-info { flex: 1; }
      .file-name { font-size: 13px; color: var(--text-primary); display: block; }
      .file-size { font-size: 11px; color: var(--text-muted); }
    }

    .upload-area { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--accent); background: var(--accent-glow); }
    }
    .upload-label { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; color: var(--text-secondary);
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--text-muted); }
      small { font-size: 11px; color: var(--text-muted); }
    }

    .details-grid { display: flex; flex-direction: column; gap: 12px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; padding-bottom: 10px; border-bottom: 1px solid var(--border-light); &:last-child { border-bottom: none; } }
    .detail-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 13px; color: var(--text-primary); }

    @media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }
  `]
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = true;
  statusControl = new FormControl('');
  commentControl = new FormControl('');
  isInternalComment = false;

  constructor(
    private route: ActivatedRoute,
    private ticketApi: TicketApiService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.loadTicket(id);
  }

  loadTicket(id: number) {
    this.ticketApi.getTicketById(id).subscribe({
      next: (res) => {
        this.ticket = res.data;
        this.statusControl.setValue(res.data.currentStatus, { emitEvent: false });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onStatusChange(status: string) {
    if (!this.ticket) return;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      const resolution = prompt('Enter resolution details (required):');
      if (!resolution) { this.statusControl.setValue(this.ticket.currentStatus, { emitEvent: false }); return; }
      this.ticketApi.updateStatus(this.ticket.id, status, resolution).subscribe({
        next: (res) => { this.ticket = res.data; this.toastr.success('Status updated'); },
        error: (e) => this.toastr.error(e.error?.message || 'Update failed')
      });
    } else {
      this.ticketApi.updateStatus(this.ticket.id, status).subscribe({
        next: (res) => { this.ticket = res.data; this.toastr.success('Status updated'); },
        error: (e) => this.toastr.error(e.error?.message || 'Update failed')
      });
    }
  }

  submitComment() {
    if (!this.ticket || !this.commentControl.value?.trim()) return;
    this.ticketApi.addComment(this.ticket.id, this.commentControl.value, this.isInternalComment).subscribe({
      next: (res) => {
        this.ticket = res.data;
        this.commentControl.reset();
        this.toastr.success('Comment added');
      },
      error: (e) => this.toastr.error(e.error?.message || 'Failed to add comment')
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && this.ticket) {
      Array.from(input.files).forEach(file => this.uploadFile(file));
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && this.ticket) {
      Array.from(event.dataTransfer.files).forEach(file => this.uploadFile(file));
    }
  }

  uploadFile(file: File) {
    if (!this.ticket) return;
    this.ticketApi.uploadAttachment(this.ticket.id, file).subscribe({
      next: (res) => { this.ticket = res.data; this.toastr.success(`${file.name} uploaded`); },
      error: (e) => this.toastr.error(e.error?.message || 'Upload failed')
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  priorityLabel(p: string): string {
    return p?.replace('P1_CRITICAL','P1 Critical').replace('P2_HIGH','P2 High').replace('P3_MEDIUM','P3 Medium').replace('P4_LOW','P4 Low') || p;
  }

  initials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  userInitials(): string {
    return this.authService.currentUser?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }

  isAdminOrSupport() { return this.authService.isAdminOrSupport(); }
}
