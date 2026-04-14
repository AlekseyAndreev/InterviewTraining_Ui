import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { GetUserInfoResponse, UpdateUserInfoRequest } from '../../models/user-info.model';

@Component({
  selector: 'app-my-user-info',
  standalone: true,
  imports: [AsyncPipe, TranslateModule, FormsModule],
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
          @if (isEditing) {
            <div class="edit-form">
              <div class="form-section">
                <label class="form-label">{{ 'USER_INFO.PHOTO_URL' | translate }}</label>
                <input type="text" class="form-input" [(ngModel)]="editFormData.photoUrl" [placeholder]="'USER_INFO.PHOTO_URL_PLACEHOLDER' | translate">
              </div>
              
              <div class="form-section">
                <label class="form-label">{{ 'USER_INFO.FULL_NAME' | translate }}</label>
                <input type="text" class="form-input" [(ngModel)]="editFormData.fullName" [placeholder]="'USER_INFO.FULL_NAME_PLACEHOLDER' | translate">
              </div>
              
              <div class="form-section">
                <label class="form-label">{{ 'USER_INFO.SHORT_DESCRIPTION' | translate }}</label>
                <input type="text" class="form-input" [(ngModel)]="editFormData.shortDescription" [placeholder]="'USER_INFO.SHORT_DESCRIPTION_PLACEHOLDER' | translate">
              </div>
              
              <div class="form-section">
                <label class="form-label">{{ 'USER_INFO.DESCRIPTION' | translate }}</label>
                <textarea class="form-textarea" [(ngModel)]="editFormData.description" [placeholder]="'USER_INFO.DESCRIPTION_PLACEHOLDER' | translate" rows="4"></textarea>
              </div>
              
              <div class="form-actions">
                <button class="btn-save" (click)="saveUserInfo()" [disabled]="isSaving">
                  @if (isSaving) {
                    {{ 'USER_INFO.SAVING' | translate }}
                  } @else {
                    {{ 'USER_INFO.SAVE' | translate }}
                  }
                </button>
                <button class="btn-cancel" (click)="cancelEdit()">{{ 'USER_INFO.CANCEL' | translate }}</button>
              </div>
            </div>
          } @else {
            @if (isLoading) {
              <div class="loading-state">
                <div class="spinner"></div>
                <p>{{ 'USER_INFO.LOADING' | translate }}</p>
              </div>
            } @else {
              <button class="btn-edit" (click)="startEdit()">{{ 'USER_INFO.EDIT' | translate }}</button>
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
            
            @if (oidcSecurityService.userData$ | async; as userData) {
              <div class="info-section">
                <div class="info-label">{{ 'USER_INFO.EMAIL' | translate }}</div>
                <div class="info-value">{{ getUserEmail(userData) || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
              </div>
              <div class="info-section">
                <div class="info-label">{{ 'USER_INFO.ROLES' | translate }}</div>
                <div class="info-value">
                  <div class="roles-container">
                    @if (getUserRoles(userData).length > 0) {
                      <div class="roles-list">
                        @for (role of getUserRoles(userData); track role) {
                          <span class="role-badge">{{ getRoleDisplayName(role) }}</span>
                        }
                      </div>
                    } @else {
                      <span>{{ 'USER_INFO.NO_ROLES' | translate }}</span>
                    }
                    <button class="btn-set-roles btn-set-roles-small" (click)="goToChangeRoles()">{{ 'USER_INFO.CHANGE_ROLES' | translate }}</button>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class MyUserInfoComponent implements OnInit {
  private config = inject(APP_CONFIG);
  private userService = inject(UserService);
  
  apiUserInfo: GetUserInfoResponse = {
    photoUrl: null,
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null
  };
  isEditing = false;
  isSaving = false;
  isLoading = true;
  
  editFormData: UpdateUserInfoRequest = {
    photoUrl: null,
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null
  };
  
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    this.isLoading = true;
    this.userService.getUserInfo().subscribe({
      next: (response) => {
        this.apiUserInfo = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.isLoading = false;
      }
    });
  }

  startEdit(): void {
    this.isEditing = true;
    this.editFormData = {
      photoUrl: this.apiUserInfo.photoUrl || null,
      photo: this.apiUserInfo.photo || null,
      fullName: this.apiUserInfo.fullName || null,
      shortDescription: this.apiUserInfo.shortDescription || null,
      description: this.apiUserInfo.description || null
    };
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveUserInfo(): void {
    this.isSaving = true;
    this.userService.updateUserInfo(this.editFormData).subscribe({
      next: (response) => {
        if (response.success) {
          this.apiUserInfo = { ...this.editFormData };
          this.isEditing = false;
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving user info:', error);
        this.isSaving = false;
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

  getUserEmail(userData: any): string | undefined {
    const data = userData?.userData || userData;
    return data?.email;
  }

  getUserRoles(userData: any): string[] {
    const data = userData?.userData || userData;
    const roles = data?.role;
    if (Array.isArray(roles)) {
      return roles;
    }
    if (typeof roles === 'string') {
      return [roles];
    }
    return [];
  }

  getRoleDisplayName(role: string): string {
    const currentLang = this.translateService.currentLang || 'en';
    const roleTranslations: Record<string, Record<string, string>> = {
      'Candidate': { en: 'Candidate', ru: 'Кандидат' },
      'Expert': { en: 'Expert', ru: 'Эксперт' }
    };
    return roleTranslations[role]?.[currentLang] || role;
  }

  goToChangeRoles(): void {
    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        redirect_to_change_roles: 'true',
        prompt: 'login'
      }
    });
  }
}
