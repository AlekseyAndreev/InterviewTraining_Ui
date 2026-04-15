import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AvailableTimeService } from '../../services/available-time.service';
import { UserService } from '../../services/user.service';
import { AvailableTimeDto, SlotStatus } from '../../models/available-time.model';
import { GetUserInfoResponse } from '../../models/user-info.model';

@Component({
  selector: 'app-book-interview',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
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
            {{ getInitials(expertInfo.fullName) }}
          </div>
          <div class="expert-details">
            <h2>{{ expertInfo.fullName || ('BOOK_INTERVIEW.EXPERT' | translate) }}</h2>
            <p class="expert-description">{{ expertInfo.shortDescription || ('BOOK_INTERVIEW.NO_DESCRIPTION' | translate) }}</p>
          </div>
        </div>

        <div class="slots-section">
          <h3>{{ 'BOOK_INTERVIEW.SELECT_TIME' | translate }}</h3>
          
          @if (isLoadingSlots) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>{{ 'BOOK_INTERVIEW.LOADING_SLOTS' | translate }}</p>
            </div>
          } @else if (availableSlots.length === 0) {
            <div class="no-slots">
              <p>{{ 'BOOK_INTERVIEW.NO_AVAILABLE_SLOTS' | translate }}</p>
            </div>
          } @else {
            <div class="slots-grid">
              @for (slot of availableSlots; track slot.id) {
                <div 
                  class="slot-card" 
                  [class.selected]="selectedSlot?.id === slot.id"
                  (click)="selectSlot(slot)">
                  <div class="slot-date">{{ slot.displayTime }}</div>
                  <div class="slot-status" [class.available]="0 === 0">
                    {{ getSlotStatusText(0) }}
                  </div>
                </div>
              }
            </div>
          }

          @if (selectedSlot) {
            <div class="booking-form">
              <h4>{{ 'BOOK_INTERVIEW.BOOKING_FORM.TITLE' | translate }}</h4>
              <div class="selected-slot-info">
                <strong>{{ 'BOOK_INTERVIEW.BOOKING_FORM.SELECTED_TIME' | translate }}:</strong> 
                {{ selectedSlot.displayTime }}
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
              <div class="form-actions">
                <button 
                  class="btn-book" 
                  (click)="bookInterview()"
                  [disabled]="isBooking">
                  @if (isBooking) {
                    {{ 'BOOK_INTERVIEW.BOOKING_FORM.BOOKING' | translate }}
                  } @else {
                    {{ 'BOOK_INTERVIEW.BOOKING_FORM.BOOK' | translate }}
                  }
                </button>
                <button class="btn-cancel" (click)="cancelBooking()">{{ 'BOOK_INTERVIEW.BOOKING_FORM.CANCEL' | translate }}</button>
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
  private translateService = inject(TranslateService);
  public oidcSecurityService = inject(OidcSecurityService);

  expertId: string | null = null;
  expertInfo: GetUserInfoResponse = {
    photoUrl: null,
    photo: null,
    fullName: null,
    shortDescription: null,
    description: null,
    selectedTimeZoneId: null,
    timeZones: []
  };

  availableSlots: AvailableTimeDto[] = [];
  selectedSlot: AvailableTimeDto | null = null;
  bookingNotes: string = '';

  isLoadingExpert = true;
  isLoadingSlots = false;
  isBooking = false;
  error = false;

  ngOnInit(): void {
    this.expertId = this.route.snapshot.paramMap.get('expertId');
    if (this.expertId) {
      this.loadExpertInfo(this.expertId);
      this.loadAvailableSlots(this.expertId);
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
        this.isLoadingExpert = false;
      },
      error: (error) => {
        console.error('Error loading expert info:', error);
        this.error = true;
        this.isLoadingExpert = false;
      }
    });
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

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  selectSlot(slot: AvailableTimeDto): void {
    this.selectedSlot = slot;
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

  bookInterview(): void {
    if (!this.selectedSlot) return;

    this.isBooking = true;
    const request = {
      notes: this.bookingNotes || undefined
    };

    this.availableTimeService.bookSlot(this.selectedSlot.id, request).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/my-user-info']);
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
    this.bookingNotes = '';
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
}
