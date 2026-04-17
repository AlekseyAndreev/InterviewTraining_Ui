import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { InterviewService } from '../../services/interview.service';
import { UserService } from '../../services/user.service';
import { GetInterviewInfoResponse } from '../../models/interview.model';

@Component({
  selector: 'app-interview-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="interview-info-container">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'INTERVIEW_INFO.LOADING' | translate }}</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <p>{{ 'INTERVIEW_INFO.ERROR' | translate }}</p>
          <button class="btn-back" (click)="goBack()">{{ 'INTERVIEW_INFO.BACK' | translate }}</button>
        </div>
      } @else if (interviewInfo) {
        <div class="interview-card">
          <div class="interview-header">
            <h1>{{ 'INTERVIEW_INFO.TITLE' | translate }}</h1>
            <span class="status-badge" [ngClass]="getStatusClass(interviewInfo.status)">
              {{ getStatusTranslation(interviewInfo.status) | translate }}
            </span>
          </div>

          <div class="interview-datetime">
            <div class="datetime-item">
              <span class="datetime-label">{{ 'INTERVIEW_INFO.START_TIME' | translate }}</span>
              <span class="datetime-value">{{ formatDateTime(interviewInfo.startDateTime) }}</span>
            </div>
            @if (interviewInfo.endDateTime) {
              <div class="datetime-item">
                <span class="datetime-label">{{ 'INTERVIEW_INFO.END_TIME' | translate }}</span>
                <span class="datetime-value">{{ formatDateTime(interviewInfo.endDateTime) }}</span>
              </div>
            }
          </div>

          <div class="participants-section">
            <div class="participant-card">
              <div class="participant-avatar">
                @if (interviewInfo.candidate.photoUrl) {
                  <img [src]="interviewInfo.candidate.photoUrl" alt="Candidate photo" class="avatar-image">
                } @else {
                  {{ getInitials(interviewInfo.candidate.fullName) }}
                }
              </div>
              <div class="participant-info">
                <span class="participant-role">{{ 'INTERVIEW_INFO.CANDIDATE' | translate }}</span>
                <h3 class="participant-name">{{ interviewInfo.candidate.fullName }}</h3>
                @if (interviewInfo.candidate.shortDescription) {
                  <p class="participant-description">{{ interviewInfo.candidate.shortDescription }}</p>
                }
              </div>
              <div class="approval-status">
                <span class="approval-badge" [ngClass]="getApprovalClass(interviewInfo.candidateApproval)">
                  {{ getApprovalText(interviewInfo.candidateApproval) | translate }}
                </span>
              </div>
            </div>

            <div class="participant-card">
              <div class="participant-avatar">
                @if (interviewInfo.expert.photoUrl) {
                  <img [src]="interviewInfo.expert.photoUrl" alt="Expert photo" class="avatar-image">
                } @else {
                  {{ getInitials(interviewInfo.expert.fullName) }}
                }
              </div>
              <div class="participant-info">
                <span class="participant-role">{{ 'INTERVIEW_INFO.EXPERT' | translate }}</span>
                <h3 class="participant-name">{{ interviewInfo.expert.fullName }}</h3>
                @if (interviewInfo.expert.shortDescription) {
                  <p class="participant-description">{{ interviewInfo.expert.shortDescription }}</p>
                }
              </div>
              <div class="approval-status">
                <span class="approval-badge" [ngClass]="getApprovalClass(interviewInfo.expertApproval)">
                  {{ getApprovalText(interviewInfo.expertApproval) | translate }}
                </span>
              </div>
            </div>
          </div>

          @if (interviewInfo.language) {
            <div class="info-section">
              <span class="info-label">{{ 'INTERVIEW_INFO.LANGUAGE' | translate }}</span>
              <span class="info-value">{{ getLanguageName(interviewInfo.language) }}</span>
            </div>
          }

          @if (interviewInfo.linkToVideoCall) {
            <div class="info-section">
              <span class="info-label">{{ 'INTERVIEW_INFO.VIDEO_CALL_LINK' | translate }}</span>
              <a [href]="interviewInfo.linkToVideoCall" target="_blank" class="video-link">
                {{ interviewInfo.linkToVideoCall }}
              </a>
            </div>
          }

          @if (interviewInfo.notes) {
            <div class="info-section">
              <span class="info-label">{{ 'INTERVIEW_INFO.NOTES' | translate }}</span>
              <p class="notes-text">{{ interviewInfo.notes }}</p>
            </div>
          }

          <div class="info-section created-info">
            <span class="info-label">{{ 'INTERVIEW_INFO.CREATED' | translate }}</span>
            <span class="info-value">{{ formatDateTime(interviewInfo.createdUtc) }}</span>
          </div>

          <div class="actions-section">
            <button class="btn-back" (click)="goBack()">{{ 'INTERVIEW_INFO.BACK' | translate }}</button>
          </div>
        </div>
      }
    </div>
  `
})
export class InterviewInfoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private interviewService = inject(InterviewService);
  private userService = inject(UserService);
  private translateService = inject(TranslateService);
  public oidcSecurityService = inject(OidcSecurityService);

  interviewInfo: GetInterviewInfoResponse | null = null;
  isLoading = true;
  error = false;
  interviewId: string | null = null;
  userTimeZoneCode: string | null = null;

  ngOnInit(): void {
    this.interviewId = this.route.snapshot.paramMap.get('id');
    this.loadUserTimeZone();
    if (this.interviewId) {
      this.loadInterviewInfo(this.interviewId);
    } else {
      this.error = true;
      this.isLoading = false;
    }
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

  private loadInterviewInfo(id: string): void {
    this.isLoading = true;
    this.interviewService.getInterviewInfo(id).subscribe({
      next: (response) => {
        this.interviewInfo = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading interview info:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
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

  getInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Scheduled': 'status-scheduled',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'NoShow': 'status-noshow'
    };
    return statusMap[status] || '';
  }

  getStatusTranslation(status: string): string {
    const translations: Record<string, string> = {
      'Scheduled': 'INTERVIEW_INFO.STATUS_SCHEDULED',
      'Completed': 'INTERVIEW_INFO.STATUS_COMPLETED',
      'Cancelled': 'INTERVIEW_INFO.STATUS_CANCELLED',
      'NoShow': 'INTERVIEW_INFO.STATUS_NO_SHOW'
    };
    return translations[status] || status;
  }

  getApprovalClass(approval: { isApproved: boolean; isCancelled: boolean }): string {
    if (approval.isCancelled) {
      return 'approval-cancelled';
    }
    if (approval.isApproved) {
      return 'approval-approved';
    }
    return 'approval-pending';
  }

  getApprovalText(approval: { isApproved: boolean; isCancelled: boolean }): string {
    if (approval.isCancelled) {
      return 'INTERVIEW_INFO.APPROVAL_CANCELLED';
    }
    if (approval.isApproved) {
      return 'INTERVIEW_INFO.APPROVAL_APPROVED';
    }
    return 'INTERVIEW_INFO.APPROVAL_PENDING';
  }

  getLanguageName(lang: { nameRu: string; nameEn: string }): string {
    const currentLang = this.translateService.currentLang || 'en';
    return currentLang === 'ru' ? lang.nameRu : lang.nameEn;
  }

  goBack(): void {
    this.router.navigate(['/my-interviews']);
  }
}
