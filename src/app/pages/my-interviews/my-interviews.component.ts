import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { InterviewService } from '../../services/interview.service';
import { InterviewDto, InterviewStatus, GetMyInterviewsResponse } from '../../models/interview.model';

@Component({
  selector: 'app-my-interviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  template: `
    <div class="my-interviews-container">
      <div class="search-header">
        <h1>{{ 'MY_INTERVIEWS.TITLE' | translate }}</h1>
        <div class="sort-controls">
          <label>{{ 'MY_INTERVIEWS.FILTER_BY_STATUS' | translate }}:</label>
          <select (change)="onStatusChange($event)" class="sort-select">
            <option value="">{{ 'MY_INTERVIEWS.ALL_STATUSES' | translate }}</option>
            <option value="Scheduled">{{ 'MY_INTERVIEWS.STATUS_SCHEDULED' | translate }}</option>
            <option value="Completed">{{ 'MY_INTERVIEWS.STATUS_COMPLETED' | translate }}</option>
            <option value="Cancelled">{{ 'MY_INTERVIEWS.STATUS_CANCELLED' | translate }}</option>
            <option value="NoShow">{{ 'MY_INTERVIEWS.STATUS_NO_SHOW' | translate }}</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'MY_INTERVIEWS.LOADING' | translate }}</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ 'MY_INTERVIEWS.ERROR' | translate }}</p>
        </div>
      }

      @if (!loading && !error && interviews.length > 0) {
        <div class="results-info">
          {{ 'MY_INTERVIEWS.TOTAL_FOUND' | translate }} {{ interviews.length }}
        </div>

        <div class="interviews-grid">
          @for (interview of interviews; track interview.id) {
            <div class="interview-card">
              <div class="interview-avatar">
                {{ getInitials(isCandidate ? interview.expertName : interview.candidateName) }}
              </div>
              <div class="interview-info">
                <h3 class="interview-name">
                  @if (isCandidate) {
                    {{ interview.expertName || ('MY_INTERVIEWS.NOT_SPECIFIED' | translate) }}
                  } @else {
                    {{ interview.candidateName || ('MY_INTERVIEWS.NOT_SPECIFIED' | translate) }}
                  }
                </h3>
                <p class="interview-description">
                  {{ 'MY_INTERVIEWS.SCHEDULED_AT' | translate }}: {{ formatDateTime(interview.scheduledAt) }}
                </p>
                <p class="interview-status">
                  <span class="status-badge" [ngClass]="getStatusClass(interview.status)">
                    {{ getStatusTranslation(interview.status) | translate }}
                  </span>
                </p>
              </div>
              <div class="interview-actions">
                <a [routerLink]="['/interview-info', interview.id]" class="btn-view">
                  {{ 'MY_INTERVIEWS.VIEW_DETAILS' | translate }}
                </a>
              </div>
            </div>
          }
        </div>

        <div class="pagination">
          <button 
            class="btn-page" 
            [disabled]="currentPage === 1" 
            (click)="goToPage(currentPage - 1)">
            ←
          </button>
          <span class="page-info">
            {{ 'MY_INTERVIEWS.PAGE' | translate }} {{ currentPage }} {{ 'MY_INTERVIEWS.OF' | translate }} {{ totalPages }}
          </span>
          <button 
            class="btn-page" 
            [disabled]="currentPage >= totalPages" 
            (click)="goToPage(currentPage + 1)">
            →
          </button>
        </div>
      }

      @if (!loading && !error && interviews.length === 0) {
        <div class="no-results">
          <p>{{ 'MY_INTERVIEWS.NO_RESULTS' | translate }}</p>
        </div>
      }
    </div>
  `
})
export class MyInterviewsComponent implements OnInit {
  interviews: InterviewDto[] = [];
  loading = false;
  error = false;
  isCandidate = false;
  selectedStatus: InterviewStatus | undefined;
  
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  private oidcSecurityService = inject(OidcSecurityService);

  constructor(
    private interviewService: InterviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadInterviews();
  }

  private checkUserRole(): void {
    this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        const roles = userData?.role as string | string[];
        this.isCandidate = Array.isArray(roles)
          ? roles.includes('Candidate')
          : roles === 'Candidate';
      }
    });
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = false;

    this.interviewService.getMyInterviews({
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      status: this.selectedStatus
    }).subscribe({
      next: (response: GetMyInterviewsResponse) => {
        this.interviews = response.data || [];
        this.totalRecords = response.totalRecords || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  getStatusClass(status: InterviewStatus): string {
    const statusClasses: Record<InterviewStatus, string> = {
      [InterviewStatus.Scheduled]: 'status-scheduled',
      [InterviewStatus.Completed]: 'status-completed',
      [InterviewStatus.Cancelled]: 'status-cancelled',
      [InterviewStatus.NoShow]: 'status-noshow'
    };
    return statusClasses[status] || '';
  }

  getStatusTranslation(status: InterviewStatus): string {
    const translations: Record<InterviewStatus, string> = {
      [InterviewStatus.Scheduled]: 'MY_INTERVIEWS.STATUS_SCHEDULED',
      [InterviewStatus.Completed]: 'MY_INTERVIEWS.STATUS_COMPLETED',
      [InterviewStatus.Cancelled]: 'MY_INTERVIEWS.STATUS_CANCELLED',
      [InterviewStatus.NoShow]: 'MY_INTERVIEWS.STATUS_NO_SHOW'
    };
    return translations[status] || status;
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value ? target.value as InterviewStatus : undefined;
    this.currentPage = 1;
    this.loadInterviews();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadInterviews();
  }
}
