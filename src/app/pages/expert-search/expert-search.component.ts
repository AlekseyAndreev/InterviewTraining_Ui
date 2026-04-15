import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ExpertService } from '../../services/expert.service';
import { GetExpertResponse, GetAllExpertsResponse } from '../../models/expert.model';

@Component({
  selector: 'app-expert-search',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="expert-search-container">
      <div class="search-header">
        <h1>{{ 'EXPERT_SEARCH.TITLE' | translate }}</h1>
        <div class="sort-controls">
          <label>{{ 'EXPERT_SEARCH.SORT_BY' | translate }}:</label>
          <select (change)="onSortChange($event)" class="sort-select">
            <option value="rating_desc">{{ 'EXPERT_SEARCH.RATING_DESC' | translate }}</option>
            <option value="rating_asc">{{ 'EXPERT_SEARCH.RATING_ASC' | translate }}</option>
            <option value="date_desc">{{ 'EXPERT_SEARCH.DATE_DESC' | translate }}</option>
            <option value="date_asc">{{ 'EXPERT_SEARCH.DATE_ASC' | translate }}</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'EXPERT_SEARCH.LOADING' | translate }}</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ 'EXPERT_SEARCH.ERROR' | translate }}</p>
        </div>
      }

      @if (!loading && !error && experts.length > 0) {
        <div class="results-info">
          {{ 'EXPERT_SEARCH.TOTAL_FOUND' | translate }} {{ experts.length }}
        </div>

        <div class="experts-grid">
          @for (expert of experts; track expert.id) {
            <div class="expert-card">
              <div class="expert-avatar">
                {{ getInitials(expert.fullName) }}
              </div>
              <div class="expert-info">
                <h3 class="expert-name">{{ expert.fullName || ('EXPERT_SEARCH.NOT_SPECIFIED' | translate) }}</h3>
                <p class="expert-description">{{ expert.shortDescription || ('EXPERT_SEARCH.NOT_SPECIFIED' | translate) }}</p>
              </div>
              <div class="expert-actions">
                <button class="btn-view" (click)="viewProfile(expert)">
                  {{ 'EXPERT_SEARCH.VIEW_PROFILE' | translate }}
                </button>
                @if (isCandidate) {
                  <button class="btn-book" (click)="bookInterview(expert)">
                    {{ 'EXPERT_SEARCH.BOOK_INTERVIEW' | translate }}
                  </button>
                }
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
            {{ 'EXPERT_SEARCH.PAGE' | translate }} {{ currentPage }} {{ 'EXPERT_SEARCH.OF' | translate }} {{ totalPages }}
          </span>
          <button 
            class="btn-page" 
            [disabled]="currentPage >= totalPages" 
            (click)="goToPage(currentPage + 1)">
            →
          </button>
        </div>
      }

      @if (!loading && !error && experts.length === 0) {
        <div class="no-results">
          <p>{{ 'EXPERT_SEARCH.NO_RESULTS' | translate }}</p>
        </div>
      }
    </div>
  `
})
export class ExpertSearchComponent implements OnInit {
  experts: GetExpertResponse[] = [];
  loading = false;
  error = false;
  isCandidate = false;
  
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  private oidcSecurityService = inject(OidcSecurityService);

  constructor(
    private expertService: ExpertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadExperts();
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

  loadExperts(): void {
    this.loading = true;
    this.error = false;

    this.expertService.getExperts({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response: GetAllExpertsResponse) => {
        this.experts = response.data || [];
        this.totalRecords = response.totalRecords || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading experts:', err);
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

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    console.log('Sort by:', target.value);
    this.loadExperts();
  }

  viewProfile(expert: GetExpertResponse): void {
    this.router.navigate(['/user-info', expert.identityServerId]);
  }

  bookInterview(expert: GetExpertResponse): void {
    this.router.navigate(['/book-interview', expert.identityServerId]);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadExperts();
  }
}
