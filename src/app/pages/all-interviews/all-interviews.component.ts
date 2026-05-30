import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InterviewService } from '../../services/interview.service';
import { InterviewForAdminDto } from '../../models/interview.model';

@Component({
  selector: 'app-all-interviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterLink],
  styleUrls: ['./all-interviews.component.css'],
  template: `
    <div class="all-interviews-container">
      <div class="search-header">
        <h1>{{ 'ALL_INTERVIEWS.TITLE' | translate }}</h1>
        <div class="search-controls">
          <input
            type="text"
            class="search-input"
            [placeholder]="'ALL_INTERVIEWS.SEARCH_PLACEHOLDER' | translate"
            [(ngModel)]="searchFilter"
            (keyup.enter)="onSearch()"
          />
          <button class="btn-search" (click)="onSearch()">{{ 'ALL_INTERVIEWS.SEARCH' | translate }}</button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'ALL_INTERVIEWS.LOADING' | translate }}</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ 'ALL_INTERVIEWS.ERROR' | translate }}</p>
        </div>
      }

      @if (!loading && !error && interviews.length > 0) {
        <div class="results-info">
          {{ 'ALL_INTERVIEWS.TOTAL_FOUND' | translate }} {{ totalRecords }}
        </div>

        <div class="interviews-grid">
          @for (interview of interviews; track interview.id) {
            <div class="interview-card" [class.interview-deleted]="interview.isDeleted" [class.interview-cancelled]="interview.isCancelledByCandidate || interview.isCancelledByExpert">
              <div class="interview-status-icon">
                {{ getStatusIcon(interview) }}
              </div>
              <div class="interview-info">
                <div class="interview-participants">
                  <div class="participant">
                    <span class="participant-label">{{ 'ALL_INTERVIEWS.EXPERT' | translate }}</span>
                    <span class="participant-name">{{ interview.expertName || ('ALL_INTERVIEWS.NOT_SPECIFIED' | translate) }}</span>
                  </div>
                  <div class="participant">
                    <span class="participant-label">{{ 'ALL_INTERVIEWS.CANDIDATE' | translate }}</span>
                    <span class="participant-name">{{ interview.candidateName || ('ALL_INTERVIEWS.NOT_SPECIFIED' | translate) }}</span>
                  </div>
                </div>
                <div class="interview-status">
                  <span class="status-badge" [ngClass]="getStatusClass(interview.status)">
                    {{ getStatusDescription(interview) }}
                  </span>
                </div>
                <div class="interview-datetime">
                  <span class="datetime-label">{{ 'ALL_INTERVIEWS.SCHEDULED_AT' | translate }}</span>
                  <span class="datetime-value">{{ formatDateTime(interview.scheduledAtUtc) }}</span>
                </div>
                <div class="interview-flags">
                  @if (interview.isDeleted) {
                    <span class="flag-badge flag-deleted">{{ 'ALL_INTERVIEWS.DELETED' | translate }}</span>
                  }
                  @if (interview.isCancelledByCandidate) {
                    <span class="flag-badge flag-cancelled-by-candidate">{{ 'ALL_INTERVIEWS.CANCELLED_BY_CANDIDATE' | translate }}</span>
                  }
                  @if (interview.isCancelledByExpert) {
                    <span class="flag-badge flag-cancelled-by-expert">{{ 'ALL_INTERVIEWS.CANCELLED_BY_EXPERT' | translate }}</span>
                  }
                  @if (interview.isConfirmedByCandidate) {
                    <span class="flag-badge flag-confirmed">{{ 'ALL_INTERVIEWS.CONFIRMED_BY_CANDIDATE' | translate }}</span>
                  }
                  @if (interview.isConfirmedByExpert) {
                    <span class="flag-badge flag-confirmed">{{ 'ALL_INTERVIEWS.CONFIRMED_BY_EXPERT' | translate }}</span>
                  }
                </div>
                <div class="interview-created">
                  <span class="created-label">{{ 'ALL_INTERVIEWS.CREATED_AT' | translate }}</span>
                  <span class="created-value">{{ formatDateTime(interview.createdAt) }}</span>
                </div>
              </div>
              <div class="interview-actions">
                <a [routerLink]="['/interview-info', interview.id]" class="btn-view">
                  {{ 'ALL_INTERVIEWS.VIEW_DETAILS' | translate }}
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
            {{ 'ALL_INTERVIEWS.PAGE' | translate }} {{ currentPage }} {{ 'ALL_INTERVIEWS.OF' | translate }} {{ totalPages }}
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
          <p>{{ 'ALL_INTERVIEWS.NO_RESULTS' | translate }}</p>
        </div>
      }
    </div>
  `
})
export class AllInterviewsComponent implements OnInit {
  interviews: InterviewForAdminDto[] = [];
  loading = false;
  error = false;

  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  totalPages = 0;

  searchFilter: string = '';

  constructor(
    private interviewService: InterviewService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = false;

    this.interviewService.getAllInterviews(
      this.currentPage,
      this.pageSize,
      this.searchFilter || null
    ).subscribe({
      next: (response) => {
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

  onSearch(): void {
    this.currentPage = 1;
    this.loadInterviews();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadInterviews();
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PendingConfirmation': 'status-scheduled',
      'ConfirmedByCandidate': 'status-scheduled',
      'ConfirmedByExpert': 'status-scheduled',
      'ConfirmedBoth': 'status-scheduled',
      'ConfirmedBothLinkCreated': 'status-scheduled',
      'ConfirmedBothAdminNotApproved': 'status-scheduled',
      'InProgress': 'status-scheduled',
      'Completed': 'status-completed',
      'CancelledByCandidate': 'status-cancelled',
      'CancelledByExpert': 'status-cancelled',
      'CancelledByCandidateAndExpert': 'status-cancelled',
      'DidNotTakePlace': 'status-noshow',
      'Draft': 'status-draft'
    };
    return statusMap[status] || 'status-scheduled';
  }

  getStatusDescription(interview: InterviewForAdminDto): string {
    const currentLang = this.translateService.getCurrentLang() || 'en';
    return currentLang === 'ru' ? interview.statusDescriptionRu : interview.statusDescriptionEn;
  }

  getStatusIcon(interview: InterviewForAdminDto): string {
    if (interview.isDeleted) return '🗑';
    if (interview.isCancelledByCandidate || interview.isCancelledByExpert) return '✕';
    if (interview.status === 'Completed') return '✓';
    if (interview.status === 'InProgress') return '▶';
    return '📅';
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    return dateStr;
  }
}
