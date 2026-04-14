import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { GetUserInfoResponse } from '../../models/user-info.model';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="user-info-container">
      <div class="user-card">
        <div class="user-card-header">
          <div class="user-card-avatar">
            @if (apiUserInfo.photoUrl) {
              <img [src]="apiUserInfo.photoUrl" alt="User photo" class="avatar-image">
            } @else {
              {{ getInitialsFromName(apiUserInfo.fullName) }}
            }
          </div>
          <h2 class="user-card-name">{{ apiUserInfo.fullName || ('NAV.USER' | translate) }}</h2>
        </div>
        
        <div class="user-card-body">
          @if (isLoading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>{{ 'USER_INFO.LOADING' | translate }}</p>
            </div>
          } @else if (error) {
            <div class="error-state">
              <p>{{ 'USER_INFO.ERROR_LOADING' | translate }}</p>
            </div>
          } @else {
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.PHOTO_URL' | translate }}</div>
              <div class="info-value">{{ apiUserInfo.photoUrl || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.FULL_NAME' | translate }}</div>
              <div class="info-value">{{ apiUserInfo.fullName || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.SHORT_DESCRIPTION' | translate }}</div>
              <div class="info-value">{{ apiUserInfo.shortDescription || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.DESCRIPTION' | translate }}</div>
              <div class="info-value">{{ apiUserInfo.description || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class UserInfoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  
  apiUserInfo: GetUserInfoResponse = {
    photoUrl: null,
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null
  };
  isLoading = true;
  error = false;
  
  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadUserInfo(userId);
    } else {
      this.isLoading = false;
      this.error = true;
    }
  }

  private loadUserInfo(userId: string): void {
    this.isLoading = true;
    this.error = false;
    this.userService.getUserInfoById(userId).subscribe({
      next: (response) => {
        this.apiUserInfo = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.isLoading = false;
        this.error = true;
      }
    });
  }

  getInitialsFromName(name: string | null): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }
}
