import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { AdminUserDto } from '../../models/user-info.model';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterLink],
  template: `
    <div class="all-users-container">
      <div class="search-header">
        <h1>{{ 'ALL_USERS.TITLE' | translate }}</h1>
        <div class="search-controls">
          <input
            type="text"
            class="search-input"
            [placeholder]="'ALL_USERS.SEARCH_PLACEHOLDER' | translate"
            [(ngModel)]="searchFilter"
            (keyup.enter)="onSearch()"
          />
          <button class="btn-search" (click)="onSearch()">{{ 'ALL_USERS.SEARCH' | translate }}</button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'ALL_USERS.LOADING' | translate }}</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ 'ALL_USERS.ERROR' | translate }}</p>
        </div>
      }

      @if (!loading && !error && users.length > 0) {
        <div class="results-info">
          {{ 'ALL_USERS.TOTAL_FOUND' | translate }} {{ totalRecords }}
        </div>

        <div class="users-grid">
          @for (user of users; track user.id) {
            <div class="user-card" [class.user-deleted]="user.isDeleted">
              <div class="user-avatar">
                {{ getInitials(user.fullName) }}
              </div>
              <div class="user-info">
                <h3 class="user-name">{{ user.fullName || ('ALL_USERS.NOT_SPECIFIED' | translate) }}</h3>
                <div class="user-roles">
                  @if (user.isCandidate) {
                    <span class="role-badge role-candidate">{{ 'ALL_USERS.ROLE_CANDIDATE' | translate }}</span>
                  }
                  @if (user.isExpert) {
                    <span class="role-badge role-expert">{{ 'ALL_USERS.ROLE_EXPERT' | translate }}</span>
                  }
                  @if (!user.isCandidate && !user.isExpert) {
                    <span class="role-badge role-none">{{ 'ALL_USERS.ROLE_NONE' | translate }}</span>
                  }
                </div>
                @if (user.isDeleted) {
                  <span class="deleted-badge">{{ 'ALL_USERS.DELETED' | translate }}</span>
                }
              </div>
              <div class="user-actions">
                <a [routerLink]="['/user-info', user.identityUserId]" class="btn-view">
                  {{ 'ALL_USERS.VIEW_PROFILE' | translate }}
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
            {{ 'ALL_USERS.PAGE' | translate }} {{ currentPage }} {{ 'ALL_USERS.OF' | translate }} {{ totalPages }}
          </span>
          <button
            class="btn-page"
            [disabled]="currentPage >= totalPages"
            (click)="goToPage(currentPage + 1)">
            →
          </button>
        </div>
      }

      @if (!loading && !error && users.length === 0) {
        <div class="no-results">
          <p>{{ 'ALL_USERS.NO_RESULTS' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .all-users-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 2rem;
    }

    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-header h1 {
      color: white;
      font-size: 2rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .search-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .search-input {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      min-width: 250px;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-search {
      background: rgba(255, 255, 255, 0.95);
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #667eea;
    }

    .btn-search:hover {
      background: white;
      transform: scale(1.05);
    }

    .results-info {
      color: white;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .user-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .user-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .user-card.user-deleted {
      opacity: 0.6;
      border: 2px dashed #e74c3c;
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.5rem;
    }

    .user-info {
      text-align: center;
    }

    .user-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .user-roles {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .role-candidate {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-expert {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .role-none {
      background: #f5f5f5;
      color: #757575;
    }

    .deleted-badge {
      display: inline-block;
      background: #ffebee;
      color: #d32f2f;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .user-actions {
      width: 100%;
    }

    .btn-view {
      display: block;
      padding: 0.75rem 1.25rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      white-space: nowrap;
      width: 100%;
      text-align: center;
      text-decoration: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-view:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-page {
      background: rgba(255, 255, 255, 0.95);
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-page:hover:not(:disabled) {
      background: white;
      transform: scale(1.05);
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: white;
      font-weight: 500;
    }

    .loading-state, .error-state, .no-results {
      text-align: center;
      padding: 3rem;
      color: white;
    }

    .loading-state .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 1rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-state {
      background: rgba(231, 76, 60, 0.2);
      border-radius: 12px;
    }

    .no-results {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    @media (max-width: 768px) {
      .search-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .search-controls {
        width: 100%;
      }

      .search-input {
        min-width: 0;
        flex: 1;
      }

      .users-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AllUsersComponent implements OnInit {
  users: AdminUserDto[] = [];
  loading = false;
  error = false;

  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  totalPages = 0;

  searchFilter: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = false;

    this.userService.getAllUsers(
      this.currentPage,
      this.pageSize,
      this.searchFilter || null
    ).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.totalRecords = response.totalRecords || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }
}