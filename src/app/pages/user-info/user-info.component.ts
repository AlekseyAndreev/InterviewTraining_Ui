import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { UserService } from '../../services/user.service';
import { SkillService } from '../../services/skill.service';
import { AvailableTimeService } from '../../services/available-time.service';
import { GetUserInfoResponse } from '../../models/user-info.model';
import { SkillGroupDto } from '../../models/skill.model';
import { AvailableTimeDto } from '../../models/available-time.model';
import { UserSkillGroupComponent } from '../../components/user-skill-group/user-skill-group.component';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [TranslateModule, UserSkillGroupComponent],
  template: `
    <div class="user-info-container">
      <div class="user-card">
        <div class="user-card-header">
          <div class="user-card-avatar">
            @if (photoPreviewUrl) {
              <img [src]="photoPreviewUrl" alt="User photo" class="avatar-image">
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
            @if (canBookInterview) {
              <div class="book-interview-section">
                <button class="btn-book-interview" (click)="bookInterview()">
                  {{ 'USER_INFO.BOOK_INTERVIEW' | translate }}
                </button>
              </div>
            }
            
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
            
            <div class="info-section">
              <div class="info-label">{{ 'SKILLS.TITLE' | translate }}</div>
              <div class="skills-container">
                @if (isLoadingSkills) {
                  <div class="loading-state">
                    <div class="spinner"></div>
                    <p>{{ 'SKILLS.LOADING' | translate }}</p>
                  </div>
                } @else if (hasSelectedSkills()) {
                  <div class="skills-tree">
                    @for (group of skillsGroups; track group.id) {
                      <app-user-skill-group 
                        [group]="group">
                      </app-user-skill-group>
                    }
                  </div>
                } @else {
                  <div class="no-skills">{{ 'SKILLS.NO_SKILLS_SELECTED' | translate }}</div>
                }
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-label">{{ 'AVAILABLE_TIME.TITLE' | translate }}</div>
              <div class="available-times-container">
                @if (isLoadingAvailableTimes) {
                  <div class="loading-state">
                    <div class="spinner"></div>
                    <p>{{ 'AVAILABLE_TIME.LOADING' | translate }}</p>
                  </div>
                } @else if (availableTimes.length > 0) {
                  <div class="available-times-list">
                    @for (time of availableTimes; track time.id) {
                      <div class="available-time-item">
                        {{ time.displayTime }}
                      </div>
                    }
                  </div>
                } @else {
                  <div class="no-available-times">{{ 'USER_INFO.NO_AVAILABLE_TIMES' | translate }}</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class UserInfoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private skillService = inject(SkillService);
  private availableTimeService = inject(AvailableTimeService);
  public oidcSecurityService = inject(OidcSecurityService);
  
  apiUserInfo: GetUserInfoResponse = {
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null,
    selectedTimeZoneId: null,
    timeZones: [],
    interviewPrice: null,
    currencyId: null,
    currencyCode: null,
    currencyNameRu: null,
    currencyNameEn: null
  };
  photoPreviewUrl: string | null = null;
  isLoading = true;
  error = false;
  
  skillsGroups: SkillGroupDto[] = [];
  isLoadingSkills = false;
  
  availableTimes: AvailableTimeDto[] = [];
  isLoadingAvailableTimes = false;
  
  userId: string | null = null;
  canBookInterview = false;
  
  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    if (this.userId) {
      this.loadUserInfo(this.userId);
      this.loadUserSkills(this.userId);
      this.loadUserAvailableTimes(this.userId);
      this.checkCanBookInterview();
    } else {
      this.isLoading = false;
      this.error = true;
    }
  }

  private checkCanBookInterview(): void {
    this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        const currentUserRoles = userData?.role as string | string[];
        const isCandidate = Array.isArray(currentUserRoles)
          ? currentUserRoles.includes('Candidate')
          : currentUserRoles === 'Candidate';
        
        this.canBookInterview = isCandidate && this.userId !== userData?.sub;
      }
    });
  }

  private loadUserInfo(userId: string): void {
    this.isLoading = true;
    this.error = false;
    this.userService.getUserInfoById(userId).subscribe({
      next: (response) => {
        this.apiUserInfo = response;
        if (response.photo) {
          const base64 = this.byteArrayToBase64(response.photo);
          if (base64) {
            this.photoPreviewUrl = 'data:image/jpeg;base64,' + base64;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.isLoading = false;
        this.error = true;
      }
    });
  }

  private byteArrayToBase64(byteArray: number[] | string | { $values?: number[] } | null): string {
    if (!byteArray) return '';
    
    let arr: number[];
    if (Array.isArray(byteArray)) {
      arr = byteArray;
    } else if (typeof byteArray === 'string') {
      return byteArray;
    } else if (byteArray && '$values' in byteArray && Array.isArray(byteArray.$values)) {
      arr = byteArray.$values;
    } else {
      return '';
    }
    
    const bytes = new Uint8Array(arr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private loadUserSkills(userId: string): void {
    this.isLoadingSkills = true;
    this.skillService.getUserSkillsTree(userId).subscribe({
      next: (response) => {
        this.skillsGroups = response.groups || [];
        this.isLoadingSkills = false;
      },
      error: (error) => {
        console.error('Error loading user skills:', error);
        this.isLoadingSkills = false;
      }
    });
  }

  private loadUserAvailableTimes(userId: string): void {
    this.isLoadingAvailableTimes = true;
    this.availableTimeService.getUserAvailableTimes(userId).subscribe({
      next: (response) => {
        this.availableTimes = response.availableTimes || [];
        this.isLoadingAvailableTimes = false;
      },
      error: (error) => {
        console.error('Error loading user available times:', error);
        this.isLoadingAvailableTimes = false;
      }
    });
  }

  hasSelectedSkills(): boolean {
    return this.skillsGroups.some(group => this.hasSelectedItemsInGroup(group));
  }

  private hasSelectedItemsInGroup(group: SkillGroupDto): boolean {
    if (group.skills && group.skills.some(skill => skill.isSelected)) {
      return true;
    }
    
    if (group.childGroups) {
      return group.childGroups.some(childGroup => this.hasSelectedItemsInGroup(childGroup));
    }
    
    return false;
  }

  getInitialsFromName(name: string | null): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  bookInterview(): void {
    if (this.userId) {
      this.router.navigate(['/book-interview', this.userId]);
    }
  }
}
