import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AvailableTimeService } from '../../services/available-time.service';
import { UserService } from '../../services/user.service';
import { InterviewService } from '../../services/interview.service';
import { SkillService } from '../../services/skill.service';
import { AvailableTimeDto, SlotStatus } from '../../models/available-time.model';
import { GetUserInfoResponse } from '../../models/user-info.model';
import { SkillGroupDto } from '../../models/skill.model';
import { InterviewLanguageDto } from '../../models/interview.model';
import { UserSkillGroupComponent } from '../../components/user-skill-group/user-skill-group.component';

type TimeSelectionMode = 'manual' | 'slots';

@Component({
  selector: 'app-book-interview',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, UserSkillGroupComponent],
  template: `
    <div class="book-interview-container">
      @if (isLoadingExpert) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'BOOK_INTERVIEW.LOADING_EXPERT' | translate }}</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <p>{{ 'BOOK_INTERVIEW.ERROR_LOADING' | translate }}</p>
          <button class="btn-back" (click)="goBack()">{{ 'BOOK_INTERVIEW.BACK' | translate }}</button>
        </div>
      } @else {
        <div class="expert-header">
          <div class="expert-avatar">
            @if (expertPhotoUrl) {
              <img [src]="expertPhotoUrl" alt="Expert photo" class="avatar-image">
            } @else {
              {{ getInitials(expertInfo.fullName) }}
            }
          </div>
          <div class="expert-details">
            <h2>{{ expertInfo.fullName || ('BOOK_INTERVIEW.EXPERT' | translate) }}</h2>
            <p class="expert-description">{{ expertInfo.shortDescription || ('BOOK_INTERVIEW.NO_DESCRIPTION' | translate) }}</p>
          </div>
        </div>

        <div class="expert-skills-section">
          <h3>{{ 'SKILLS.TITLE' | translate }}</h3>
          @if (isLoadingSkills) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>{{ 'SKILLS.LOADING' | translate }}</p>
            </div>
          } @else if (hasSelectedSkills()) {
            <div class="skills-tree">
              @for (group of skillGroups; track group.id) {
                <app-user-skill-group 
                  [group]="group"
                  class="skill-group-item">
                </app-user-skill-group>
              }
            </div>
          } @else {
            <div class="no-skills">
              <p>{{ 'SKILLS.NO_SKILLS_SELECTED' | translate }}</p>
            </div>
          }
        </div>

        <div class="expert-availability-section">
          <h3>{{ 'BOOK_INTERVIEW.EXPERT_AVAILABILITY' | translate }}</h3>
          @if (isLoadingAvailableTimes) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>{{ 'AVAILABLE_TIME.LOADING' | translate }}</p>
            </div>
          } @else if (expertAvailableTimes.length > 0) {
            <div class="availability-list">
              @for (time of expertAvailableTimes; track time.id) {
                <div class="availability-item">
                  <span class="availability-type-badge" [ngClass]="getAvailabilityTypeClass(time.availabilityType)">
                    {{ getAvailabilityTypeText(time.availabilityType) | translate }}
                  </span>
                  <span class="availability-display">{{ time.displayTime }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="no-availability">
              <p>{{ 'BOOK_INTERVIEW.NO_EXPERT_AVAILABILITY' | translate }}</p>
            </div>
          }
        </div>

        <div class="slots-section">
          <h3>{{ 'BOOK_INTERVIEW.SELECT_TIME' | translate }}</h3>
          
          <div class="time-mode-selector">
            <label class="radio-option">
              <input type="radio" name="timeMode" value="manual" [(ngModel)]="timeSelectionMode">
              <span>{{ 'BOOK_INTERVIEW.TIME_MODE_MANUAL' | translate }}</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="timeMode" value="slots" [(ngModel)]="timeSelectionMode">
              <span>{{ 'BOOK_INTERVIEW.TIME_MODE_SLOTS' | translate }}</span>
            </label>
          </div>

          @if (timeSelectionMode === 'slots') {
            <div class="slots-not-available">
              <p>{{ 'BOOK_INTERVIEW.SLOTS_NOT_AVAILABLE' | translate }}</p>
            </div>
          } @else {
            <div class="booking-form">
              <h4>{{ 'BOOK_INTERVIEW.BOOKING_FORM.TITLE' | translate }}</h4>
              
              <div class="form-section">
                <label class="form-label">{{ 'AVAILABLE_TIME.DATE' | translate }}</label>
                <input type="date" class="form-input" [(ngModel)]="selectedDate">
              </div>

              <div class="form-section">
                <label class="form-label">{{ 'AVAILABLE_TIME.TIME' | translate }}</label>
                <input type="time" class="form-input" [(ngModel)]="selectedTime">
              </div>

              <div class="form-section">
                <label class="form-label">{{ 'BOOK_INTERVIEW.BOOKING_FORM.NOTES' | translate }}</label>
                <textarea 
                  class="form-textarea" 
                  [(ngModel)]="bookingNotes"
                  [placeholder]="'BOOK_INTERVIEW.BOOKING_FORM.NOTES_PLACEHOLDER' | translate"
                  rows="3">
                </textarea>
              </div>

              <div class="form-section">
                <label class="form-label">{{ 'BOOK_INTERVIEW.BOOKING_FORM.LANGUAGE' | translate }}</label>
                <select class="form-input" [(ngModel)]="selectedLanguageId">
                  <option [ngValue]="null">{{ 'BOOK_INTERVIEW.BOOKING_FORM.SELECT_LANGUAGE' | translate }}</option>
                  @for (lang of interviewLanguages; track lang.id) {
                    <option [ngValue]="lang.id">{{ getLanguageName(lang) }}</option>
                  }
                </select>
              </div>

              <div class="form-actions">
                <button 
                  class="btn-book" 
                  (click)="bookInterview()"
                  [disabled]="isBooking || !isFormValid()">
                  @if (isBooking) {
                    {{ 'BOOK_INTERVIEW.BOOKING_FORM.BOOKING' | translate }}
                  } @else {
                    {{ 'BOOK_INTERVIEW.BOOKING_FORM.BOOK' | translate }}
                  }
                </button>
              </div>
            </div>
          }
        </div>

        <button class="btn-back" (click)="goBack()">{{ 'BOOK_INTERVIEW.BACK' | translate }}</button>
      }
    </div>
  `
})
export class BookInterviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private availableTimeService = inject(AvailableTimeService);
  private userService = inject(UserService);
  private interviewService = inject(InterviewService);
  private skillService = inject(SkillService);
  private translateService = inject(TranslateService);
  public oidcSecurityService = inject(OidcSecurityService);

  expertId: string | null = null;
  expertInfo: GetUserInfoResponse = {
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null,
    selectedTimeZoneId: null,
    timeZones: []
  };
  expertPhotoUrl: string | null = null;

  availableSlots: AvailableTimeDto[] = [];
  expertAvailableTimes: AvailableTimeDto[] = [];
  selectedSlot: AvailableTimeDto | null = null;
  selectedDate: string = '';
  selectedTime: string = '';
  bookingNotes: string = '';
  skillGroups: SkillGroupDto[] = [];
  interviewLanguages: InterviewLanguageDto[] = [];
  selectedLanguageId: string | null = null;
  timeSelectionMode: TimeSelectionMode = 'manual';

  isLoadingExpert = true;
  isLoadingSlots = false;
  isLoadingSkills = false;
  isLoadingAvailableTimes = false;
  isBooking = false;
  error = false;

  ngOnInit(): void {
    this.expertId = this.route.snapshot.paramMap.get('expertId');
    if (this.expertId) {
      this.loadExpertInfo(this.expertId);
      this.loadExpertSkills(this.expertId);
      this.loadInterviewLanguages();
      this.loadExpertAvailableTime(this.expertId);
    } else {
      this.error = true;
      this.isLoadingExpert = false;
    }
  }

  private loadExpertInfo(expertId: string): void {
    this.isLoadingExpert = true;
    this.userService.getUserInfoById(expertId).subscribe({
      next: (response) => {
        this.expertInfo = response;
        if (response.photo && response.photo.length > 0) {
          this.expertPhotoUrl = 'data:image/jpeg;base64,' + this.byteArrayToBase64(response.photo);
        }
        this.isLoadingExpert = false;
      },
      error: (error) => {
        console.error('Error loading expert info:', error);
        this.error = true;
        this.isLoadingExpert = false;
      }
    });
  }

  private byteArrayToBase64(byteArray: number[]): string {
    const bytes = new Uint8Array(byteArray);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private loadAvailableSlots(expertId: string): void {
    this.isLoadingSlots = true;
    const today = new Date();
    const toDate = new Date();
    toDate.setDate(today.getDate() + 30);

    const request = {
      fromDate: this.formatDate(today),
      toDate: this.formatDate(toDate)
    };

    this.availableTimeService.getExpertAvailableSlots(expertId, request).subscribe({
      next: (response) => {
        this.availableSlots = response.availableTimes;
        this.isLoadingSlots = false;
      },
      error: (error) => {
        console.error('Error loading available slots:', error);
        this.availableSlots = [];
        this.isLoadingSlots = false;
      }
    });
  }

  private loadExpertSkills(expertId: string): void {
    this.isLoadingSkills = true;
    this.skillService.getUserSkillsTree(expertId).subscribe({
      next: (response) => {
        this.skillGroups = response.groups || [];
        this.isLoadingSkills = false;
      },
      error: (error) => {
        console.error('Error loading expert skills:', error);
        this.skillGroups = [];
        this.isLoadingSkills = false;
      }
    });
  }

  private loadInterviewLanguages(): void {
    this.interviewService.getInterviewLanguages().subscribe({
      next: (response) => {
        this.interviewLanguages = response || [];
      },
      error: (error) => {
        console.error('Error loading interview languages:', error);
        this.interviewLanguages = [];
      }
    });
  }

  private loadExpertAvailableTime(expertId: string): void {
    this.isLoadingAvailableTimes = true;
    const today = new Date();
    const toDate = new Date();
    toDate.setDate(today.getDate() + 30);

    const request = {
      fromDate: this.formatDate(today),
      toDate: this.formatDate(toDate)
    };

    this.availableTimeService.getExpertAvailableSlots(expertId, request).subscribe({
      next: (response) => {
        this.expertAvailableTimes = response.availableTimes || [];
        this.isLoadingAvailableTimes = false;
      },
      error: (error) => {
        console.error('Error loading expert available time:', error);
        this.expertAvailableTimes = [];
        this.isLoadingAvailableTimes = false;
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  selectSlot(slot: AvailableTimeDto): void {
    this.selectedSlot = slot;
    if (slot.specificDate) {
      this.selectedDate = slot.specificDate;
    }
    if (slot.startTime) {
      this.selectedTime = slot.startTime;
    }
  }

  getSlotStatusText(status: SlotStatus): string {
    const currentLang = this.translateService.getCurrentLang() || 'en';
    const statusTexts: Record<number, Record<string, string>> = {
      [SlotStatus.Available]: { en: 'Available', ru: 'Доступно' },
      [SlotStatus.Booked]: { en: 'Booked', ru: 'Занято' },
      [SlotStatus.Completed]: { en: 'Completed', ru: 'Завершено' },
      [SlotStatus.Cancelled]: { en: 'Cancelled', ru: 'Отменено' }
    };
    return statusTexts[status]?.[currentLang] || 'Unknown';
  }

  isFormValid(): boolean {
    return this.selectedDate !== '' && this.selectedTime !== '';
  }

  bookInterview(): void {
    if (!this.expertId || !this.isFormValid()) return;

    this.isBooking = true;

    const request = {
      expertId: this.expertId,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.bookingNotes || undefined,
      interviewLanguageId: this.selectedLanguageId
    };

    this.interviewService.createInterview(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/my-interviews']);
        }
        this.isBooking = false;
      },
      error: (error) => {
        console.error('Error booking interview:', error);
        this.isBooking = false;
      }
    });
  }

  cancelBooking(): void {
    this.selectedSlot = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.bookingNotes = '';
    this.selectedLanguageId = null;
  }

  goBack(): void {
    this.router.navigate(['/expert-search']);
  }

  getInitials(name: string | null): string {
    if (!name) return 'E';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  getLanguageName(lang: InterviewLanguageDto): string {
    const currentLang = this.translateService.getCurrentLang() || 'en';
    return currentLang === 'ru' ? lang.nameRu : lang.nameEn;
  }

  hasSelectedSkills(): boolean {
    return this.skillGroups.some(group => this.hasSelectedItemsInGroup(group));
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

  getAvailabilityTypeClass(type: number): string {
    const typeClasses: Record<number, string> = {
      0: 'type-always',
      1: 'type-weekly',
      2: 'type-weekly-time',
      3: 'type-specific'
    };
    return typeClasses[type] || '';
  }

  getAvailabilityTypeText(type: number): string {
    const typeTexts: Record<number, string> = {
      0: 'AVAILABLE_TIME.TYPE_ALWAYS',
      1: 'AVAILABLE_TIME.TYPE_WEEKLY_DAY',
      2: 'AVAILABLE_TIME.TYPE_WEEKLY_TIME',
      3: 'AVAILABLE_TIME.TYPE_SPECIFIC'
    };
    return typeTexts[type] || '';
  }
}
