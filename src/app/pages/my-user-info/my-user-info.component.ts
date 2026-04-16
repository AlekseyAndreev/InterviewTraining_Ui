import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { SkillService } from '../../services/skill.service';
import { AvailableTimeService } from '../../services/available-time.service';
import { GetUserInfoResponse, UpdateUserInfoRequest } from '../../models/user-info.model';
import { SkillGroupDto } from '../../models/skill.model';
import { AvailableTimeDto, CreateAvailableTimeRequest, UpdateAvailableTimeRequest } from '../../models/available-time.model';
import { SkillGroupComponent } from '../../components/skill-group/skill-group.component';
import { AvailableTimeFormComponent } from '../../components/available-time-form/available-time-form.component';
import { AvailableTimeListComponent } from '../../components/available-time-list/available-time-list.component';

type TabName = 'profile' | 'skills' | 'timezone' | 'availability' | 'roles';

@Component({
  selector: 'app-my-user-info',
  standalone: true,
  imports: [AsyncPipe, TranslateModule, FormsModule, SkillGroupComponent, AvailableTimeFormComponent, AvailableTimeListComponent],
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
        
        <div class="tabs-container">
          <div class="tabs-nav">
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'profile'"
              (click)="activeTab = 'profile'">
              {{ 'TABS.PROFILE' | translate }}
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'skills'"
              (click)="activeTab = 'skills'">
              {{ 'TABS.SKILLS' | translate }}
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'timezone'"
              (click)="activeTab = 'timezone'">
              {{ 'TABS.TIMEZONE' | translate }}
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'availability'"
              (click)="activeTab = 'availability'">
              {{ 'TABS.AVAILABILITY' | translate }}
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'roles'"
              (click)="activeTab = 'roles'">
              {{ 'TABS.ROLES' | translate }}
            </button>
          </div>

          <div class="tab-content">
            @if (activeTab === 'profile') {
              @if (isLoading) {
                <div class="loading-state">
                  <div class="spinner"></div>
                  <p>{{ 'USER_INFO.LOADING' | translate }}</p>
                </div>
              } @else {
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
                  <button class="btn-edit" (click)="startEdit()">{{ 'USER_INFO.EDIT' | translate }}</button>
                  
                  @if (oidcSecurityService.userData$ | async; as userData) {
                    <div class="info-section">
                      <div class="info-label">{{ 'USER_INFO.EMAIL' | translate }}</div>
                      <div class="info-value info-value-readonly">{{ getUserEmail(userData) || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
                    </div>
                  }
                  
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
              }
            }

            @if (activeTab === 'roles') {
              @if (oidcSecurityService.userData$ | async; as userData) {
                <div class="roles-section">
                  <p class="roles-description">{{ 'USER_INFO.ROLES_DESCRIPTION' | translate }}</p>
                  
                  <div class="current-roles">
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
                          <span class="no-roles-text">{{ 'USER_INFO.NO_ROLES' | translate }}</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <button class="btn-change-roles" (click)="goToChangeRoles()">{{ 'USER_INFO.CHANGE_ROLES' | translate }}</button>
                </div>
              }
            }

            @if (activeTab === 'skills') {
              <div class="skills-container">
                @if (isLoadingSkills) {
                  <div class="loading-state">
                    <div class="spinner"></div>
                    <p>{{ 'SKILLS.LOADING' | translate }}</p>
                  </div>
                } @else if (skillsGroups.length > 0) {
                  <div class="skills-tree">
                    @for (group of skillsGroups; track group.id) {
                      <app-skill-group 
                        [group]="group"
                        [selectedSkills]="selectedSkills"
                        (skillToggled)="toggleSkill($event)">
                      </app-skill-group>
                    }
                  </div>
                  <div class="skills-actions">
                    <button class="btn-save-skills" (click)="saveSkills()" [disabled]="isSavingSkills">
                      @if (isSavingSkills) {
                        {{ 'SKILLS.SAVING' | translate }}
                      } @else {
                        {{ 'SKILLS.SAVE' | translate }}
                      }
                    </button>
                  </div>
                } @else {
                  <div class="no-skills">{{ 'SKILLS.NO_SKILLS' | translate }}</div>
                }
              </div>
            }

            @if (activeTab === 'timezone') {
              @if (isLoading) {
                <div class="loading-state">
                  <div class="spinner"></div>
                  <p>{{ 'USER_INFO.LOADING' | translate }}</p>
                </div>
              } @else {
                <div class="timezone-section">
                  <p class="timezone-description">{{ 'USER_INFO.TIMEZONE_DESCRIPTION' | translate }}</p>
                  
                  <div class="form-section">
                    <label class="form-label">{{ 'USER_INFO.TIME_ZONE' | translate }}</label>
                    <select class="form-input" [(ngModel)]="selectedTimeZoneId">
                      <option [ngValue]="null">{{ 'USER_INFO.SELECT_TIME_ZONE' | translate }}</option>
                      @for (tz of apiUserInfo.timeZones; track tz.id) {
                        <option [ngValue]="tz.id">{{ tz.description }} ({{ tz.code }})</option>
                      }
                    </select>
                  </div>
                  
                  <div class="form-actions">
                    <button class="btn-save" (click)="saveTimeZone()" [disabled]="isSavingTimeZone">
                      @if (isSavingTimeZone) {
                        {{ 'USER_INFO.SAVING' | translate }}
                      } @else {
                        {{ 'USER_INFO.SAVE' | translate }}
                      }
                    </button>
                  </div>
                </div>
              }
            }

            @if (activeTab === 'availability') {
              <div class="available-time-container">
                @if (isLoadingAvailableTimes) {
                  <div class="loading-state">
                    <div class="spinner"></div>
                    <p>{{ 'AVAILABLE_TIME.LOADING' | translate }}</p>
                  </div>
                } @else {
                  <app-available-time-list 
                    [availableTimes]="availableTimes"
                    (edit)="onEditAvailableTime($event)"
                    (delete)="onDeleteAvailableTime($event)">
                  </app-available-time-list>
                  
                  @if (showAvailableTimeForm) {
                    <app-available-time-form
                      [editingTime]="editingAvailableTime"
                      [isSaving]="isSavingAvailableTime"
                      (saveTime)="onSaveAvailableTime($event)"
                      (updateTime)="onUpdateAvailableTime($event)"
                      (cancel)="onCancelAvailableTimeForm()">
                    </app-available-time-form>
                  } @else {
                    <button class="btn-add-time" (click)="showAddAvailableTimeForm()">
                      {{ 'AVAILABLE_TIME.ADD_TIME' | translate }}
                    </button>
                  }
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyUserInfoComponent implements OnInit {
  private config = inject(APP_CONFIG);
  private userService = inject(UserService);
  private skillService = inject(SkillService);
  private availableTimeService = inject(AvailableTimeService);
  
  activeTab: TabName = 'profile';
  
  apiUserInfo: GetUserInfoResponse = {
    photoUrl: null,
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null,
    selectedTimeZoneId: null,
    timeZones: []
  };
  isEditing = false;
  isSaving = false;
  isLoading = true;
  isSavingTimeZone = false;
  selectedTimeZoneId: string | null = null;
  
  skillsGroups: SkillGroupDto[] = [];
  selectedSkills: Set<string> = new Set();
  isLoadingSkills = false;
  isSavingSkills = false;
  
  availableTimes: AvailableTimeDto[] = [];
  isLoadingAvailableTimes = false;
  isSavingAvailableTime = false;
  showAvailableTimeForm = false;
  editingAvailableTime: AvailableTimeDto | null = null;
  
  editFormData: UpdateUserInfoRequest = {
    photoUrl: null,
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null,
    selectedTimeZoneId: null
  };
  
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadSkillsTree();
    this.loadAvailableTimes();
  }

  private loadUserInfo(): void {
    this.isLoading = true;
    this.userService.getUserInfo().subscribe({
      next: (response) => {
        this.apiUserInfo = response;
        this.selectedTimeZoneId = response.selectedTimeZoneId;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.isLoading = false;
      }
    });
  }

  private loadSkillsTree(): void {
    this.isLoadingSkills = true;
    this.skillService.getSkillsTree().subscribe({
      next: (response) => {
        this.skillsGroups = response.groups || [];
        this.isLoadingSkills = false;
      },
      error: (error) => {
        console.error('Error loading skills tree:', error);
        this.isLoadingSkills = false;
      }
    });
  }

  toggleSkill(skillId: string): void {
    if (this.selectedSkills.has(skillId)) {
      this.selectedSkills.delete(skillId);
    } else {
      this.selectedSkills.add(skillId);
    }
  }

  saveSkills(): void {
    this.isSavingSkills = true;
    const skillIds = Array.from(this.selectedSkills);
    this.skillService.addSkills(skillIds).subscribe({
      next: () => {
        this.isSavingSkills = false;
      },
      error: (error) => {
        console.error('Error saving skills:', error);
        this.isSavingSkills = false;
      }
    });
  }

  getSelectedTimeZoneName(): string {
    if (!this.apiUserInfo.selectedTimeZoneId || !this.apiUserInfo.timeZones) {
      return '';
    }
    const tz = this.apiUserInfo.timeZones.find(t => t.id === this.apiUserInfo.selectedTimeZoneId);
    return tz ? `${tz.description} (${tz.code})` : '';
  }

  startEdit(): void {
    this.isEditing = true;
    this.editFormData = {
      photoUrl: this.apiUserInfo.photoUrl || null,
      photo: this.apiUserInfo.photo || null,
      fullName: this.apiUserInfo.fullName || null,
      shortDescription: this.apiUserInfo.shortDescription || null,
      description: this.apiUserInfo.description || null,
      selectedTimeZoneId: this.apiUserInfo.selectedTimeZoneId || null
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
          this.apiUserInfo = { 
            ...this.apiUserInfo,
            ...this.editFormData 
          };
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

  saveTimeZone(): void {
    this.isSavingTimeZone = true;
    const request: UpdateUserInfoRequest = {
      photoUrl: this.apiUserInfo.photoUrl,
      photo: this.apiUserInfo.photo,
      fullName: this.apiUserInfo.fullName,
      shortDescription: this.apiUserInfo.shortDescription,
      description: this.apiUserInfo.description,
      selectedTimeZoneId: this.selectedTimeZoneId
    };
    this.userService.updateUserInfo(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.apiUserInfo.selectedTimeZoneId = this.selectedTimeZoneId;
        }
        this.isSavingTimeZone = false;
      },
      error: (error) => {
        console.error('Error saving timezone:', error);
        this.isSavingTimeZone = false;
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

  private loadAvailableTimes(): void {
    this.isLoadingAvailableTimes = true;
    this.availableTimeService.getAvailableTimes().subscribe({
      next: (response) => {
        this.availableTimes = response.availableTimes || [];
        this.isLoadingAvailableTimes = false;
      },
      error: (error) => {
        console.error('Error loading available times:', error);
        this.isLoadingAvailableTimes = false;
      }
    });
  }

  showAddAvailableTimeForm(): void {
    this.showAvailableTimeForm = true;
    this.editingAvailableTime = null;
  }

  onEditAvailableTime(time: AvailableTimeDto): void {
    this.editingAvailableTime = time;
    this.showAvailableTimeForm = true;
  }

  onDeleteAvailableTime(time: AvailableTimeDto): void {
    if (confirm(this.translateService.instant('AVAILABLE_TIME.CONFIRM_DELETE'))) {
      this.availableTimeService.deleteAvailableTime(time.id).subscribe({
        next: () => {
          this.availableTimes = this.availableTimes.filter(t => t.id !== time.id);
        },
        error: (error) => {
          console.error('Error deleting available time:', error);
        }
      });
    }
  }

  onSaveAvailableTime(request: CreateAvailableTimeRequest): void {
    this.isSavingAvailableTime = true;
    this.availableTimeService.createAvailableTime(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAvailableTimes();
          this.showAvailableTimeForm = false;
          this.editingAvailableTime = null;
        }
        this.isSavingAvailableTime = false;
      },
      error: (error) => {
        console.error('Error saving available time:', error);
        this.isSavingAvailableTime = false;
      }
    });
  }

  onUpdateAvailableTime(event: { id: string; request: UpdateAvailableTimeRequest }): void {
    this.isSavingAvailableTime = true;
    this.availableTimeService.updateAvailableTime(event.id, event.request).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAvailableTimes();
          this.showAvailableTimeForm = false;
          this.editingAvailableTime = null;
        }
        this.isSavingAvailableTime = false;
      },
      error: (error) => {
        console.error('Error updating available time:', error);
        this.isSavingAvailableTime = false;
      }
    });
  }

  onCancelAvailableTimeForm(): void {
    this.showAvailableTimeForm = false;
    this.editingAvailableTime = null;
  }
}
