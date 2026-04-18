import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { InterviewService } from '../../services/interview.service';
import { UserService } from '../../services/user.service';
import { InterviewDto, GetMyInterviewsResponse } from '../../models/interview.model';

type InterviewFilterType = 'active' | 'all' | 'completed' | 'completed-success' | 'completed-failed' | 'cancelled';

interface InterviewFilter {
  key: InterviewFilterType;
  statuses: string[];
}

@Component({
  selector: 'app-my-interviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  template: `
    <div class="my-interviews-container">
      <div class="search-header">
        <h1>{{ 'MY_INTERVIEWS.TITLE' | translate }}</h1>
        <div class="filter-controls">
          <label>{{ 'MY_INTERVIEWS.FILTER_BY_STATUS' | translate }}:</label>
          <select (change)="onFilterChange($event)" class="filter-select">
            <option value="active" [selected]="selectedFilter === 'active'">{{ 'MY_INTERVIEWS.FILTER_ACTIVE' | translate }}</option>
            <option value="all" [selected]="selectedFilter === 'all'">{{ 'MY_INTERVIEWS.FILTER_ALL' | translate }}</option>
            <option value="completed" [selected]="selectedFilter === 'completed'">{{ 'MY_INTERVIEWS.FILTER_COMPLETED' | translate }}</option>
            <option value="completed-success" [selected]="selectedFilter === 'completed-success'">{{ 'MY_INTERVIEWS.FILTER_COMPLETED_SUCCESS' | translate }}</option>
            <option value="completed-failed" [selected]="selectedFilter === 'completed-failed'">{{ 'MY_INTERVIEWS.FILTER_COMPLETED_FAILED' | translate }}</option>
            <option value="cancelled" [selected]="selectedFilter === 'cancelled'">{{ 'MY_INTERVIEWS.FILTER_CANCELLED' | translate }}</option>
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

      @if (!loading && !error && filteredInterviews.length > 0) {
        <div class="results-info">
          {{ 'MY_INTERVIEWS.TOTAL_FOUND' | translate }} {{ filteredInterviews.length }}
        </div>

        <div class="interviews-grid">
          @for (interview of filteredInterviews; track interview.id) {
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
                    {{ getStatusDescription(interview) }}
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

      @if (!loading && !error && filteredInterviews.length === 0) {
        <div class="no-results">
          <p>{{ 'MY_INTERVIEWS.NO_RESULTS' | translate }}</p>
        </div>
      }
    </div>
  `
})
export class MyInterviewsComponent implements OnInit {
  allInterviews: InterviewDto[] = [];
  interviews: InterviewDto[] = [];
  filteredInterviews: InterviewDto[] = [];
  loading = false;
  error = false;
  isCandidate = false;
  userTimeZoneCode: string | null = null;
  
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  
  selectedFilter: InterviewFilterType = 'active';

  private readonly filters: InterviewFilter[] = [
    { 
      key: 'active', 
      statuses: [
        'PendingConfirmation',
        'ConfirmedByCandidate',
        'ConfirmedByExpert',
        'ConfirmedBothAdminNotApproved',
        'ConfirmedBothAdminApprovedTimeDidNotStart',
        'InProgress'
      ]
    },
    { 
      key: 'all', 
      statuses: [] 
    },
    { 
      key: 'completed', 
      statuses: [
        'Completed',
        'TimeExpiredCandidateDidNotApprove',
        'TimeExpiredExpertDidNotApprove',
        'TimeExpiredBothDidNotApprove',
        'TimeExpiredBothApprovedAdminDidNotApprove'
      ]
    },
    { 
      key: 'completed-success', 
      statuses: ['Completed']
    },
    { 
      key: 'completed-failed', 
      statuses: [
        'TimeExpiredCandidateDidNotApprove',
        'TimeExpiredExpertDidNotApprove',
        'TimeExpiredBothDidNotApprove',
        'TimeExpiredBothApprovedAdminDidNotApprove'
      ]
    },
    { 
      key: 'cancelled', 
      statuses: [
        'CancelledByCandidate',
        'CancelledByExpert',
        'CancelledByCandidateAndExpert'
      ]
    }
  ];

  private oidcSecurityService = inject(OidcSecurityService);

  constructor(
    private interviewService: InterviewService,
    private userService: UserService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadUserTimeZone();
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

  private loadUserTimeZone(): void {
    this.userService.getUserInfo().subscribe({
      next: (response) => {
        if (response.selectedTimeZoneId && response.timeZones) {
          const tz = response.timeZones.find(t => t.id === response.selectedTimeZoneId);
          this.userTimeZoneCode = tz?.code || null;
        }
      },
      error: (err) => {
        console.error('Error loading user timezone:', err);
      }
    });
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = false;

    this.interviewService.getMyInterviews({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response: GetMyInterviewsResponse) => {
        this.allInterviews = response.data || [];
        this.totalRecords = response.totalRecords || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading interviews:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const filter = this.filters.find(f => f.key === this.selectedFilter);
    
    if (!filter || filter.statuses.length === 0) {
      this.filteredInterviews = [...this.allInterviews];
    } else {
      this.filteredInterviews = this.allInterviews.filter(interview => 
        filter.statuses.includes(interview.status)
      );
    }
  }

  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedFilter = target.value as InterviewFilterType;
    this.applyFilter();
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
    if (!dateStr) return '';
    
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      const timeZoneStr = this.userTimeZoneCode ? ` (${this.userTimeZoneCode})` : '';
      return `${day}.${month}.${year} ${hours}:${minutes}${timeZoneStr}`;
    }
    
    return dateStr;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'PendingConfirmation': 'status-scheduled',
      'ConfirmedByCandidate': 'status-scheduled',
      'ConfirmedByExpert': 'status-scheduled',
      'ConfirmedBothAdminNotApproved': 'status-scheduled',
      'ConfirmedBothAdminApprovedTimeDidNotStart': 'status-scheduled',
      'InProgress': 'status-inprogress',
      'Completed': 'status-completed',
      'TimeExpiredCandidateDidNotApprove': 'status-noshow',
      'TimeExpiredExpertDidNotApprove': 'status-noshow',
      'TimeExpiredBothDidNotApprove': 'status-noshow',
      'TimeExpiredBothApprovedAdminDidNotApprove': 'status-noshow',
      'CancelledByCandidate': 'status-cancelled',
      'CancelledByExpert': 'status-cancelled',
      'CancelledByCandidateAndExpert': 'status-cancelled',
      'Draft': 'status-draft',
      'Unknown': 'status-unknown'
    };
    return statusClasses[status] || 'status-scheduled';
  }

  getStatusDescription(interview: InterviewDto): string {
    const currentLang = this.translateService.currentLang || 'en';
    return currentLang === 'ru' ? interview.statusDescriptionRu : interview.statusDescriptionEn;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadInterviews();
  }
}
