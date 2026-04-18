import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { InterviewService } from '../../services/interview.service';
import { UserService } from '../../services/user.service';
import { GetInterviewInfoResponse } from '../../models/interview.model';

@Component({
  selector: 'app-interview-info',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterModule],
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
            <div class="participant-card-wrapper">
              @if (isCurrentUserCandidate()) {
                <div class="you-badge">{{ 'INTERVIEW_INFO.YOU' | translate }}</div>
              } @else {
                <div class="you-badge you-badge-placeholder">&nbsp;</div>
              }
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
                <a [routerLink]="['/user-info', interviewInfo.candidate.identityUserId]" class="btn-view-profile">
                  {{ 'INTERVIEW_INFO.VIEW_PROFILE' | translate }}
                </a>
              </div>
            </div>

            <div class="participant-card-wrapper">
              @if (isCurrentUserExpert()) {
                <div class="you-badge">{{ 'INTERVIEW_INFO.YOU' | translate }}</div>
              } @else {
                <div class="you-badge you-badge-placeholder">&nbsp;</div>
              }
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
                <a [routerLink]="['/user-info', interviewInfo.expert.identityUserId]" class="btn-view-profile">
                  {{ 'INTERVIEW_INFO.VIEW_PROFILE' | translate }}
                </a>
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

            @if (interviewInfo.candidateApproval.cancelReason || interviewInfo.expertApproval.cancelReason) {
              <div class="info-section cancel-reason-section">
                @if (interviewInfo.candidateApproval.cancelReason) {
                  <span class="info-label">{{ 'INTERVIEW_INFO.CANCEL_REASON_CANDIDATE' | translate }}</span>
                  <p class="cancel-reason-text">{{ interviewInfo.candidateApproval.cancelReason }}</p>
                }
                @if (interviewInfo.expertApproval.cancelReason) {
                  <span class="info-label">{{ 'INTERVIEW_INFO.CANCEL_REASON_EXPERT' | translate }}</span>
                  <p class="cancel-reason-text">{{ interviewInfo.expertApproval.cancelReason }}</p>
                }
              </div>
            }

           <div class="info-section created-info">
             <span class="info-label">{{ 'INTERVIEW_INFO.CREATED' | translate }}</span>
             <span class="info-value">{{ formatDateTime(interviewInfo.createdUtc) }}</span>
           </div>

            @if (canCancelInterview()) {
              <div class="cancel-section">
                @if (showCancelForm) {
                  <div class="cancel-form">
                    <div class="form-group">
                      <label class="form-label">{{ 'INTERVIEW_INFO.CANCEL_REASON_LABEL' | translate }}</label>
                      <textarea 
                        class="form-textarea" 
                        [(ngModel)]="cancelReason" 
                        [placeholder]="'INTERVIEW_INFO.CANCEL_REASON_PLACEHOLDER' | translate"
                        rows="3">
                      </textarea>
                    </div>
                    <div class="cancel-actions">
                      <button class="btn-confirm-cancel" (click)="confirmCancelInterview()" [disabled]="isCancelling">
                        @if (isCancelling) {
                          {{ 'INTERVIEW_INFO.CANCELLING' | translate }}
                        } @else {
                          {{ 'INTERVIEW_INFO.CONFIRM_CANCEL' | translate }}
                        }
                      </button>
                      <button class="btn-cancel-action" (click)="showCancelForm = false" [disabled]="isCancelling">
                        {{ 'INTERVIEW_INFO.CANCEL_ACTION' | translate }}
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="interview-actions-row">
                    @if (canConfirmInterview()) {
                      <button class="btn-confirm-interview" (click)="confirmInterview()" [disabled]="isConfirming">
                        @if (isConfirming) {
                          {{ 'INTERVIEW_INFO.CONFIRMING' | translate }}
                        } @else {
                          {{ 'INTERVIEW_INFO.CONFIRM_INTERVIEW' | translate }}
                        }
                      </button>
                    }
                    <button class="btn-cancel-interview" (click)="showCancelForm = true">
                      {{ 'INTERVIEW_INFO.CANCEL_INTERVIEW' | translate }}
                    </button>
                  </div>
                }
              </div>
            } @else if (canConfirmInterview()) {
              <div class="cancel-section">
                <button class="btn-confirm-interview" (click)="confirmInterview()" [disabled]="isConfirming">
                  @if (isConfirming) {
                    {{ 'INTERVIEW_INFO.CONFIRMING' | translate }}
                  } @else {
                    {{ 'INTERVIEW_INFO.CONFIRM_INTERVIEW' | translate }}
                  }
                </button>
              </div>
            }

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
  currentUserId: string | null = null;
  showCancelForm = false;
  cancelReason: string = '';
  isCancelling = false;
  isConfirming = false;

  ngOnInit(): void {
    this.interviewId = this.route.snapshot.paramMap.get('id');
    this.loadCurrentUserId();
    this.loadUserTimeZone();
    if (this.interviewId) {
      this.loadInterviewInfo(this.interviewId);
    } else {
      this.error = true;
      this.isLoading = false;
    }
  }

  private loadCurrentUserId(): void {
    this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        this.currentUserId = userData?.sub || null;
      }
    });
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

  isCurrentUserCandidate(): boolean {
    if (!this.interviewInfo || !this.currentUserId) return false;
    return this.interviewInfo.candidate.identityUserId === this.currentUserId;
  }

  isCurrentUserExpert(): boolean {
    if (!this.interviewInfo || !this.currentUserId) return false;
    return this.interviewInfo.expert.identityUserId === this.currentUserId;
  }

  canCancelInterview(): boolean {
    if (!this.interviewInfo || !this.currentUserId) return false;
    
    const isCandidate = this.interviewInfo.candidate.identityUserId === this.currentUserId;
    const isExpert = this.interviewInfo.expert.identityUserId === this.currentUserId;
    
    if (!isCandidate && !isExpert) return false;
    
    if (isCandidate && this.interviewInfo.candidateApproval.isCancelled) return false;
    if (isExpert && this.interviewInfo.expertApproval.isCancelled) return false;
    
    return true;
  }

  confirmCancelInterview(): void {
    if (!this.interviewId || this.isCancelling) return;
    
    this.isCancelling = true;
    this.interviewService.cancelInterview(this.interviewId, {
      cancelReason: this.cancelReason || null
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showCancelForm = false;
          this.loadInterviewInfo(this.interviewId!);
        }
        this.isCancelling = false;
      },
      error: (error) => {
        console.error('Error cancelling interview:', error);
        this.isCancelling = false;
      }
    });
  }

  canConfirmInterview(): boolean {
    if (!this.interviewInfo || !this.currentUserId) return false;
    
    const isCandidate = this.interviewInfo.candidate.identityUserId === this.currentUserId;
    const isExpert = this.interviewInfo.expert.identityUserId === this.currentUserId;
    
    if (!isCandidate && !isExpert) return false;
    
    if (isCandidate && this.interviewInfo.candidateApproval.isApproved) return false;
    if (isExpert && this.interviewInfo.expertApproval.isApproved) return false;
    
    if (this.interviewInfo.candidateApproval.isCancelled || this.interviewInfo.expertApproval.isCancelled) return false;
    
    return true;
  }

  confirmInterview(): void {
    if (!this.interviewId || this.isConfirming) return;
    
    this.isConfirming = true;
    this.interviewService.confirmInterview(this.interviewId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadInterviewInfo(this.interviewId!);
        }
        this.isConfirming = false;
      },
      error: (error) => {
        console.error('Error confirming interview:', error);
        this.isConfirming = false;
      }
    });
  }
}
