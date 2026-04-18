import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { SkillService } from '../../services/skill.service';
import { AvailableTimeService } from '../../services/available-time.service';
import { GetUserInfoResponse, UpdateUserInfoRequest, UpdateUserTimeZoneRequest, TimeZoneDto, CurrencyDto } from '../../models/user-info.model';
import { SkillGroupDto } from '../../models/skill.model';
import { AvailableTimeDto, CreateAvailableTimeRequest, UpdateAvailableTimeRequest } from '../../models/available-time.model';
import { SkillGroupComponent } from '../../components/skill-group/skill-group.component';
import { AvailableTimeFormComponent } from '../../components/available-time-form/available-time-form.component';
import { AvailableTimeListComponent } from '../../components/available-time-list/available-time-list.component';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
            @if (photoPreviewUrl) {
              <img [src]="photoPreviewUrl" alt="User photo" class="avatar-image">
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
                      <label class="form-label">{{ 'USER_INFO.PHOTO' | translate }}</label>
                      <div class="photo-upload-container">
                        <input type="file" 
                               #photoInput
                               class="photo-input-hidden" 
                               accept="image/jpeg,image/png,image/gif,image/webp"
                               (change)="onPhotoSelected($event)">
                        <button type="button" class="btn-upload-photo" (click)="photoInput.click()">
                          {{ 'USER_INFO.SELECT_PHOTO' | translate }}
                        </button>
                        @if (selectedPhotoFile) {
                          <span class="selected-file-name">{{ selectedPhotoFile.name }}</span>
                          <button type="button" class="btn-remove-photo" (click)="removeSelectedPhoto()">
                            {{ 'USER_INFO.REMOVE_PHOTO' | translate }}
                          </button>
                        }
                        @if (photoErrorMessage) {
                          <div class="photo-error">{{ photoErrorMessage }}</div>
                        }
                      </div>
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
                     
                     @if (isExpert) {
                       <div class="form-section">
                         <label class="form-label">{{ 'USER_INFO.INTERVIEW_PRICE' | translate }}</label>
                         <div class="price-input-wrapper">
                           <input type="number" step="0.01" min="0" class="form-input price-input" [(ngModel)]="editFormData.interviewPrice" [placeholder]="'USER_INFO.INTERVIEW_PRICE_PLACEHOLDER' | translate">
                           <select class="form-input currency-select" [(ngModel)]="editFormData.currencyId">
                             <option [ngValue]="null">{{ 'USER_INFO.SELECT_CURRENCY' | translate }}</option>
                             @for (currency of currencies; track currency.id) {
                               <option [ngValue]="currency.id">{{ currency.code }}</option>
                             }
                           </select>
                         </div>
                       </div>
                     }
                     
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
                    @if (isExpert) {
                      <div class="info-section">
                        <div class="info-label">{{ 'USER_INFO.INTERVIEW_PRICE' | translate }}</div>
                        @if (apiUserInfo.interviewPrice !== null && apiUserInfo.interviewPrice !== undefined) {
                          <div class="info-value">{{ apiUserInfo.interviewPrice }} {{ getCurrencyDisplayName() }}</div>
                        } @else {
                          <div class="info-value">{{ 'USER_INFO.NOT_SPECIFIED' | translate }}</div>
                        }
                      </div>
                    }                  
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
                    <div class="timezone-input-wrapper">
                      <div class="timezone-search-container" #timezoneSearchContainer>
                        <input 
                          type="text" 
                          class="form-input timezone-search-input"
                          [placeholder]="'USER_INFO.SEARCH_TIME_ZONE' | translate"
                          [(ngModel)]="timezoneSearchQuery"
                          (click)="showTimezoneDropdown = true"
                          (input)="filterTimeZones()">
                        
                        @if (showTimezoneDropdown && filteredTimeZones.length > 0) {
                          <div class="timezone-dropdown">
                            @for (tz of filteredTimeZones; track tz.id) {
                              <div 
                                class="timezone-option" 
                                [class.selected]="tz.id === selectedTimeZoneId"
                                (click)="selectTimeZone(tz.id)">
                                {{ tz.description }} ({{ tz.code }})
                              </div>
                            }
                          </div>
                        }
                      </div>
                      @if (apiUserInfo.selectedTimeZoneId) {
                        <button type="button" class="btn-clear-timezone" (click)="clearTimeZoneSelection()">
                          {{ 'USER_INFO.CLEAR_SELECTION' | translate }}
                        </button>
                      }
                    </div>
                    
                    @if (apiUserInfo.selectedTimeZoneId) {
                      <div class="selected-timezone-display">
                        <span class="selected-timezone-label">{{ 'USER_INFO.SAVED_TIME_ZONE' | translate }}:</span>
                        <span class="selected-timezone-value">{{ getSavedTimeZoneName() }}</span>
                      </div>
                    }
                  </div>
                  
                  <div class="form-actions">
                    <button class="btn-save" (click)="saveTimeZone()" [disabled]="isSavingTimeZone || !hasTimeZoneChanged()">
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
  
  @ViewChild('photoInput') photoInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('timezoneSearchContainer') timezoneSearchContainerRef!: ElementRef;
  
  activeTab: TabName = 'profile';
  
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
  selectedPhotoFile: File | null = null;
  photoErrorMessage: string | null = null;
  isEditing = false;
  isSaving = false;
  isLoading = true;
  isSavingTimeZone = false;
  selectedTimeZoneId: string | null = null;
  timezoneSearchQuery: string = '';
  showTimezoneDropdown: boolean = false;
  filteredTimeZones: TimeZoneDto[] = [];
  
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
    fullName: null,
    shortDescription: null,
    description: null,
    interviewPrice: null,
    currencyId: null,
  };
  
  currencies: CurrencyDto[] = [];
  isLoadingCurrencies = false;
  isExpert = false;
  
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadSkillsTree();
    this.loadAvailableTimes();
    this.checkExpertRole();
    this.loadCurrencies();
  }

  private checkExpertRole(): void {
    this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        const roles = userData?.role;
        if (Array.isArray(roles)) {
          this.isExpert = roles.includes('Expert');
        } else if (typeof roles === 'string') {
          this.isExpert = roles === 'Expert';
        }
      }
    });
  }

  private loadCurrencies(): void {
    this.isLoadingCurrencies = true;
    this.userService.getAllCurrencies().subscribe({
      next: (response) => {
        this.currencies = response || [];
        this.isLoadingCurrencies = false;
      },
      error: (error) => {
        console.error('Error loading currencies:', error);
        this.isLoadingCurrencies = false;
      }
    });
  }

  private loadUserInfo(): void {
    this.isLoading = true;
    this.userService.getUserInfo().subscribe({
      next: (response) => {
        this.apiUserInfo = response;
        this.selectedTimeZoneId = response.selectedTimeZoneId;
        this.filteredTimeZones = response.timeZones || [];
        if (response.selectedTimeZoneId) {
          const selectedTz = response.timeZones?.find(tz => tz.id === response.selectedTimeZoneId);
          if (selectedTz) {
            this.timezoneSearchQuery = `${selectedTz.description} (${selectedTz.code})`;
          }
        }
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
    this.selectedPhotoFile = null;
    this.photoErrorMessage = null;
    this.editFormData = {
      fullName: this.apiUserInfo.fullName || null,
      shortDescription: this.apiUserInfo.shortDescription || null,
      description: this.apiUserInfo.description || null,
      interviewPrice: this.apiUserInfo.interviewPrice || null,
      currencyId: this.apiUserInfo.currencyId || null,
    };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedPhotoFile = null;
    this.photoErrorMessage = null;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }
    
    this.photoErrorMessage = null;
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.photoErrorMessage = this.translateService.instant('USER_INFO.INVALID_PHOTO_TYPE');
      input.value = '';
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      this.photoErrorMessage = this.translateService.instant('USER_INFO.PHOTO_TOO_LARGE');
      input.value = '';
      return;
    }
    
    this.selectedPhotoFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedPhoto(): void {
    this.selectedPhotoFile = null;
    this.photoErrorMessage = null;
    if (this.apiUserInfo.photo) {
      const base64 = this.byteArrayToBase64(this.apiUserInfo.photo);
      if (base64) {
        this.photoPreviewUrl = 'data:image/jpeg;base64,' + base64;
      } else {
        this.photoPreviewUrl = null;
      }
    } else {
      this.photoPreviewUrl = null;
    }
    if (this.photoInputRef) {
      this.photoInputRef.nativeElement.value = '';
    }
  }

  saveUserInfo(): void {
    this.isSaving = true;
    
    this.userService.updateUserInfo(this.editFormData, this.selectedPhotoFile).subscribe({
      next: (response) => {
        if (response.success) {
          this.apiUserInfo = { 
            ...this.apiUserInfo,
            ...this.editFormData 
          };
          this.selectedPhotoFile = null;
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
    const request: UpdateUserTimeZoneRequest = {
      timeZoneId: this.selectedTimeZoneId
    };
    this.userService.updateUserTimeZone(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.apiUserInfo.selectedTimeZoneId = this.selectedTimeZoneId;
          this.showTimezoneDropdown = false;
        }
        this.isSavingTimeZone = false;
      },
      error: (error) => {
        console.error('Error saving timezone:', error);
        this.isSavingTimeZone = false;
      }
    });
  }

  filterTimeZones(): void {
    const query = this.timezoneSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredTimeZones = this.apiUserInfo.timeZones || [];
    } else {
      this.filteredTimeZones = (this.apiUserInfo.timeZones || []).filter(tz => 
        tz.description.toLowerCase().includes(query) || 
        tz.code.toLowerCase().includes(query)
      );
    }
    this.showTimezoneDropdown = true;
  }

  selectTimeZone(tzId: string): void {
    this.selectedTimeZoneId = tzId;
    const selectedTz = this.apiUserInfo.timeZones?.find(tz => tz.id === tzId);
    if (selectedTz) {
      this.timezoneSearchQuery = `${selectedTz.description} (${selectedTz.code})`;
    }
    this.showTimezoneDropdown = false;
  }

  clearTimeZoneSelection(): void {
    this.selectedTimeZoneId = null;
    this.timezoneSearchQuery = '';
    this.filteredTimeZones = this.apiUserInfo.timeZones || [];
  }

  hasTimeZoneChanged(): boolean {
    return this.selectedTimeZoneId !== this.apiUserInfo.selectedTimeZoneId;
  }

  getSavedTimeZoneName(): string {
    if (!this.apiUserInfo.selectedTimeZoneId || !this.apiUserInfo.timeZones) {
      return '';
    }
    const tz = this.apiUserInfo.timeZones.find(t => t.id === this.apiUserInfo.selectedTimeZoneId);
    return tz ? `${tz.description} (${tz.code})` : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.timezoneSearchContainerRef && !this.timezoneSearchContainerRef.nativeElement.contains(event.target)) {
      this.showTimezoneDropdown = false;
    }
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

  getCurrencyDisplayName(): string {
    if (!this.apiUserInfo.currencyId) return '';
    const currentLang = this.translateService.currentLang || 'en';
    return currentLang === 'ru' ? (this.apiUserInfo.currencyNameRu || '') : (this.apiUserInfo.currencyNameEn || '');
  }
}
