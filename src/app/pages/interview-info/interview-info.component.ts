import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { InterviewService } from '../../services/interview.service';
import { UserService } from '../../services/user.service';
import { InterviewNotificationService } from '../../services/interview-notification.service';
import { GetInterviewInfoResponse, ChatMessageFrom, ChatMessageDto, GetChatMessagesResponse } from '../../models/interview.model';
import { Subscription } from 'rxjs';

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
              {{ getStatusDescription(interviewInfo) }}
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
            @if (interviewInfo.candidateApproval.isRescheduled || interviewInfo.expertApproval.isRescheduled) {
              <div class="rescheduled-info">
                @if (interviewInfo.candidateApproval.isRescheduled) {
                  <span class="rescheduled-badge">{{ 'INTERVIEW_INFO.RESCHEDULED_BY_CANDIDATE' | translate }}</span>
                }
                @if (interviewInfo.expertApproval.isRescheduled) {
                  <span class="rescheduled-badge">{{ 'INTERVIEW_INFO.RESCHEDULED_BY_EXPERT' | translate }}</span>
                }
              </div>
            }
            @if (canRescheduleInterview()) {
              <button class="btn-reschedule-inline" (click)="startReschedule()">
                {{ 'INTERVIEW_INFO.RESCHEDULE_INTERVIEW' | translate }}
              </button>
            }
          </div>

          @if (canRescheduleInterview() && showRescheduleForm) {
            <div class="reschedule-section">
              <div class="reschedule-form">
                <div class="form-group">
                  <label class="form-label">{{ 'INTERVIEW_INFO.NEW_DATE' | translate }}</label>
                  <input type="date" class="form-input" [(ngModel)]="rescheduleDate">
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'INTERVIEW_INFO.NEW_TIME' | translate }}</label>
                  <input type="time" class="form-input" [(ngModel)]="rescheduleTime">
                </div>
                <div class="reschedule-actions">
                  <button class="btn-reschedule" (click)="rescheduleInterview()" [disabled]="isRescheduling || !rescheduleDate || !rescheduleTime">
                    @if (isRescheduling) {
                      {{ 'INTERVIEW_INFO.RESCHEDULING' | translate }}
                    } @else {
                      {{ 'INTERVIEW_INFO.CONFIRM_RESCHEDULE' | translate }}
                    }
                  </button>
                  <button class="btn-cancel-action" (click)="cancelReschedule()" [disabled]="isRescheduling">
                    {{ 'INTERVIEW_INFO.CANCEL_ACTION' | translate }}
                  </button>
                </div>
              </div>
            </div>
          }

          @if (canConfirmInterview()) {
            <div class="confirm-section">
              <button class="btn-confirm-interview" (click)="confirmInterview()" [disabled]="isConfirming">
                @if (isConfirming) {
                  {{ 'INTERVIEW_INFO.CONFIRMING' | translate }}
                } @else {
                  {{ 'INTERVIEW_INFO.CONFIRM_INTERVIEW' | translate }}
                }
              </button>
            </div>
          }

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
                @if (!shouldHideApprovalStatus('candidate')) {
                  <div class="approval-status">
                    <span class="approval-badge" [ngClass]="getApprovalClass(interviewInfo.candidateApproval)">
                      {{ getApprovalText(interviewInfo.candidateApproval) | translate }}
                    </span>
                  </div>
                }
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
                @if (!shouldHideApprovalStatus('expert')) {
                  <div class="approval-status">
                    <span class="approval-badge" [ngClass]="getApprovalClass(interviewInfo.expertApproval)">
                      {{ getApprovalText(interviewInfo.expertApproval) | translate }}
                    </span>
                  </div>
                }
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

           @if (interviewInfo.interviewPrice !== null && interviewInfo.interviewPrice !== undefined) {
             <div class="info-section">
               <span class="info-label">{{ 'INTERVIEW_INFO.INTERVIEW_SUM' | translate }}</span>
               <span class="info-value">{{ interviewInfo.interviewPrice }} {{ getInterviewCurrencyName() }}</span>
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
                   <button class="btn-cancel-interview" (click)="showCancelForm = true">
                     {{ 'INTERVIEW_INFO.CANCEL_INTERVIEW' | translate }}
                   </button>
                 }
               </div>
             }

             <div class="actions-section">
               <button class="btn-back" (click)="goBack()">{{ 'INTERVIEW_INFO.BACK' | translate }}</button>
             </div>

            @if (chatMessages !== null) {
              <div class="chat-section">
                <h3 class="chat-title">{{ 'INTERVIEW_INFO.CHAT_TITLE' | translate }}</h3>
                
                <div class="chat-messages" #chatMessagesContainer>
                  @if (isLoadingMessages) {
                    <div class="chat-loading">
                      <div class="spinner"></div>
                      <p>{{ 'INTERVIEW_INFO.LOADING_MESSAGES' | translate }}</p>
                    </div>
                  } @else {
                    @for (message of chatMessages; track message.id) {
                      <div class="chat-message" [ngClass]="getMessageClass(message)">
                        <div class="message-header">
                          <span class="message-from">{{ getMessageFromText(message) | translate }}</span>
                          <span class="message-time">{{ formatMessageTime(message.created) }}</span>
                          @if (message.isEdited) {
                            <span class="message-edited">{{ 'INTERVIEW_INFO.EDITED' | translate }}</span>
                          }
                        </div>
                        @if (editingMessageId === message.id) {
                          <div class="message-edit-form">
                            <textarea 
                              class="message-edit-input" 
                              [(ngModel)]="editingMessageText"
                              rows="2">
                            </textarea>
                            <div class="message-edit-actions">
                              <button class="btn-save-edit" (click)="saveEditMessage(message.id)" [disabled]="isSavingMessage || !editingMessageText.trim()">
                                @if (isSavingMessage) {
                                  {{ 'INTERVIEW_INFO.SAVING' | translate }}
                                } @else {
                                  {{ 'INTERVIEW_INFO.SAVE' | translate }}
                                }
                              </button>
                              <button class="btn-cancel-edit" (click)="cancelEditMessage()" [disabled]="isSavingMessage">
                                {{ 'INTERVIEW_INFO.CANCEL' | translate }}
                              </button>
                            </div>
                          </div>
                        } @else {
                          <div class="message-text">{{ message.text }}</div>
                          @if (canEditMessage(message)) {
                            <button class="btn-edit-message" (click)="startEditMessage(message)">
                              {{ 'INTERVIEW_INFO.EDIT_MESSAGE' | translate }}
                            </button>
                          }
                        }
                      </div>
                    } @empty {
                      <div class="chat-empty-state">
                        <p class="chat-empty-text">{{ 'INTERVIEW_INFO.NO_MESSAGES' | translate }}</p>
                      </div>
                    }
                  }
                </div>
                
                <div class="chat-input-section">
                  <textarea 
                    class="chat-input" 
                    [(ngModel)]="newMessageText" 
                    [placeholder]="'INTERVIEW_INFO.MESSAGE_PLACEHOLDER' | translate"
                    rows="2"
                    (keydown.enter)="onMessageKeydown($any($event))">
                  </textarea>
                  <button class="btn-send-message" (click)="sendMessage()" [disabled]="isSendingMessage || !newMessageText.trim()">
                    @if (isSendingMessage) {
                      {{ 'INTERVIEW_INFO.SENDING' | translate }}
                    } @else {
                      {{ 'INTERVIEW_INFO.SEND' | translate }}
                    }
                  </button>
                </div>
              </div>
            }
         </div>
       }
     </div>
   `
})
export class InterviewInfoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private interviewService = inject(InterviewService);
  private userService = inject(UserService);
  private translateService = inject(TranslateService);
  public oidcSecurityService = inject(OidcSecurityService);
  private notificationService = inject(InterviewNotificationService);

  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  interviewInfo: GetInterviewInfoResponse | null = null;
  chatMessages: ChatMessageDto[] | null = null;
  isLoading = true;
  isLoadingMessages = false;
  error = false;
  interviewId: string | null = null;
  userTimeZoneCode: string | null = null;
  currentUserId: string | null = null;
  showCancelForm = false;
  cancelReason: string = '';
  isCancelling = false;
  isConfirming = false;
  showRescheduleForm = false;
  rescheduleDate: string = '';
  rescheduleTime: string = '';
  isRescheduling = false;
  
  newMessageText: string = '';
  isSendingMessage = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  isSavingMessage = false;
  isAdmin = false;
  
  private signalRSubscriptions: Subscription[] = [];

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
    this.initSignalR();
  }

  private initSignalR(): void {
    if (!this.interviewId) return;
    
    this.oidcSecurityService.getAccessToken().subscribe(token => {
      if (token) {
        this.notificationService.startConnection(token, this.interviewId!);
        this.subscribeToNotifications();
      }
    });
  }

  private subscribeToNotifications(): void {
    const versionSub = this.notificationService.interviewVersionChanged$
      .subscribe(notification => {
        if (notification.interviewId === this.interviewId) {
          this.loadInterviewInfo(notification.interviewId);
        }
      });
    
    const messageCreatedSub = this.notificationService.chatMessageCreated$
      .subscribe(notification => {
        console.log('Processing ChatMessageCreated:', notification);
        if (notification.interviewId === this.interviewId) {
          const newMessage: ChatMessageDto = {
            id: notification.id,
            created: notification.createdUtc,
            modified: notification.modifiedUtc,
            text: notification.text,
            from: notification.from,
            isEdited: notification.isEdited
          };
          if (this.chatMessages === null) {
            this.chatMessages = [newMessage];
            setTimeout(() => this.scrollToBottom(), 0);
          } else {
            const exists = this.chatMessages.some(m => m.id === notification.id);
            if (!exists) {
              this.chatMessages = [...this.chatMessages, newMessage];
              setTimeout(() => this.scrollToBottom(), 0);
            }
          }
        }
      });
    
    const messageUpdatedSub = this.notificationService.chatMessageUpdated$
      .subscribe(notification => {
        if (notification.interviewId === this.interviewId && this.chatMessages !== null) {
          this.chatMessages = this.chatMessages.map(msg => {
            if (msg.id === notification.id) {
              return {
                ...msg,
                text: notification.text,
                modified: notification.modifiedUtc,
                isEdited: notification.isEdited
              };
            }
            return msg;
          });
        }
      });
    
    this.signalRSubscriptions = [versionSub, messageCreatedSub, messageUpdatedSub];
  }

  ngOnDestroy(): void {
    this.signalRSubscriptions.forEach(sub => sub.unsubscribe());
    this.signalRSubscriptions = [];
  }

  private loadCurrentUserId(): void {
    this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        this.currentUserId = userData?.sub || null;
        const roles = userData?.role;
        if (Array.isArray(roles)) {
          this.isAdmin = roles.includes('Admin');
        } else if (typeof roles === 'string') {
          this.isAdmin = roles === 'Admin';
        }
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
        this.loadChatMessages(id);
      },
      error: (error) => {
        console.error('Error loading interview info:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  private loadChatMessages(id: string): void {
    this.isLoadingMessages = true;
    this.interviewService.getChatMessages(id).subscribe({
      next: (response: GetChatMessagesResponse) => {
        this.chatMessages = response.messages || [];
        this.isLoadingMessages = false;
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (error) => {
        console.error('Error loading chat messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  private scrollToBottom(): void {
    if (this.chatMessagesContainer) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
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
      'PendingConfirmation': 'status-scheduled',
      'ConfirmedByCandidate': 'status-scheduled',
      'ConfirmedByExpert': 'status-scheduled',
      'ConfirmedBoth': 'status-scheduled',
      'ConfirmedBothLinkCreated': 'status-scheduled',
      'InProgress': 'status-scheduled',
      'Completed': 'status-completed',
      'CancelledByCandidate': 'status-cancelled',
      'CancelledByExpert': 'status-cancelled',
      'CancelledByCandidateAndExpert': 'status-cancelled',
      'DidNotTakePlace': 'status-noshow',
      'Draft': 'status-draft'
    };
    return statusMap[status] || 'status-scheduled';
  }

  getStatusDescription(interview: GetInterviewInfoResponse): string {
    const currentLang = this.translateService.getCurrentLang() || 'en';
    return currentLang === 'ru' ? interview.statusDescriptionRu : interview.statusDescriptionEn;
  }

  shouldHideApprovalStatus(participant: 'candidate' | 'expert'): boolean {
    if (!this.interviewInfo) return false;
    
    const candidateCancelled = this.interviewInfo.candidateApproval.isCancelled;
    const expertCancelled = this.interviewInfo.expertApproval.isCancelled;
    
    if (candidateCancelled && participant === 'expert') {
      return true;
    }
    
    if (expertCancelled && participant === 'candidate') {
      return true;
    }
    
    return false;
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
    const currentLang = this.translateService.getCurrentLang() || 'en';
    return currentLang === 'ru' ? lang.nameRu : lang.nameEn;
  }

  getInterviewCurrencyName(): string {
    if (!this.interviewInfo) return '';
    const currentLang = this.translateService.getCurrentLang() || 'en';
    return currentLang === 'ru' ? (this.interviewInfo.currencyNameRu || '') : (this.interviewInfo.currencyNameEn || '');
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
    
    if (this.interviewInfo.candidateApproval.isCancelled || this.interviewInfo.expertApproval.isCancelled) return false;
    
    const isCandidate = this.interviewInfo.candidate.identityUserId === this.currentUserId;
    const isExpert = this.interviewInfo.expert.identityUserId === this.currentUserId;
    
    if (!isCandidate && !isExpert) return false;
    
    const candidateAllowedStatuses = [
      'PendingConfirmation',
      'ConfirmedByCandidate',
      'ConfirmedByExpert',
      'ConfirmedBoth'
    ];
    
    const expertAllowedStatuses = [
      'PendingConfirmation',
      'ConfirmedByCandidate',
      'ConfirmedByExpert',
      'ConfirmedBoth'
    ];
    
    if (isCandidate && !candidateAllowedStatuses.includes(this.interviewInfo.status)) return false;
    if (isExpert && !expertAllowedStatuses.includes(this.interviewInfo.status)) return false;
    
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
    
    const candidateAllowedStatuses = ['PendingConfirmation', 'ConfirmedByExpert'];
    const expertAllowedStatuses = ['PendingConfirmation', 'ConfirmedByCandidate'];
    
    if (isCandidate && !candidateAllowedStatuses.includes(this.interviewInfo.status)) return false;
    if (isExpert && !expertAllowedStatuses.includes(this.interviewInfo.status)) return false;
    
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

  canRescheduleInterview(): boolean {
    if (!this.interviewInfo || !this.currentUserId) return false;
    
    const allowedStatuses = [
      'PendingConfirmation',
      'ConfirmedByCandidate',
      'ConfirmedByExpert',
      'TimeExpiredCandidateDidNotApprove',
      'TimeExpiredExpertDidNotApprove',
      'TimeExpiredBothDidNotApprove',
      'TimeExpiredBothApprovedAdminDidNotApprove',
    ];
    
    if (!allowedStatuses.includes(this.interviewInfo.status)) return false;
    
    const isCandidate = this.interviewInfo.candidate.identityUserId === this.currentUserId;
    const isExpert = this.interviewInfo.expert.identityUserId === this.currentUserId;
    
    return isCandidate || isExpert;
  }

  startReschedule(): void {
    if (!this.interviewInfo) return;
    
    const match = this.interviewInfo.startDateTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      this.rescheduleDate = `${year}-${month}-${day}`;
      this.rescheduleTime = `${hours}:${minutes}`;
    }
    this.showRescheduleForm = true;
  }

  cancelReschedule(): void {
    this.showRescheduleForm = false;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  rescheduleInterview(): void {
    if (!this.interviewId || this.isRescheduling || !this.rescheduleDate || !this.rescheduleTime) return;
    
    this.isRescheduling = true;
    this.interviewService.rescheduleInterview(this.interviewId, {
      newDate: this.rescheduleDate,
      newTime: this.rescheduleTime
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showRescheduleForm = false;
          this.loadInterviewInfo(this.interviewId!);
        }
        this.isRescheduling = false;
      },
      error: (error) => {
        console.error('Error rescheduling interview:', error);
        this.isRescheduling = false;
      }
    });
  }

  getMessageClass(message: ChatMessageDto): string {
    if (message.from === ChatMessageFrom.System) {
      return 'message-system';
    }
    if (message.from === ChatMessageFrom.Candidate) {
      return 'message-candidate';
    }
    if (message.from === ChatMessageFrom.Expert) {
      return 'message-expert';
    }
    if (message.from === ChatMessageFrom.Admin) {
      return 'message-admin';
    }
    return 'message-unknown';
  }

  getMessageFromText(message: ChatMessageDto): string {
    if (message.from === ChatMessageFrom.System) {
      return 'INTERVIEW_INFO.FROM_SYSTEM';
    }
    if (message.from === ChatMessageFrom.Candidate) {
      return 'INTERVIEW_INFO.FROM_CANDIDATE';
    }
    if (message.from === ChatMessageFrom.Expert) {
      return 'INTERVIEW_INFO.FROM_EXPERT';
    }
    if (message.from === ChatMessageFrom.Admin) {
      return 'INTERVIEW_INFO.FROM_ADMIN';
    }
    return 'INTERVIEW_INFO.FROM_UNKNOWN';
  }

  formatMessageTime(dateStr: string): string {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    return dateStr;
  }

  canEditMessage(message: ChatMessageDto): boolean {
    if (message.from === ChatMessageFrom.System) return false;
    
    if (this.isCurrentUserCandidate() && message.from === ChatMessageFrom.Candidate) {
      return true;
    }
    if (this.isCurrentUserExpert() && message.from === ChatMessageFrom.Expert) {
      return true;
    }
    if (this.isAdmin && message.from === ChatMessageFrom.Admin) {
      return true;
    }
    
    return false;
  }

  startEditMessage(message: ChatMessageDto): void {
    this.editingMessageId = message.id;
    this.editingMessageText = message.text;
  }

  cancelEditMessage(): void {
    this.editingMessageId = null;
    this.editingMessageText = '';
  }

  saveEditMessage(messageId: string): void {
    if (!this.interviewId || this.isSavingMessage || !this.editingMessageText.trim()) return;
    
    this.isSavingMessage = true;
    this.interviewService.updateChatMessage(this.interviewId, messageId, {
      messageText: this.editingMessageText.trim()
    }).subscribe({
      next: () => {
        this.editingMessageId = null;
        this.editingMessageText = '';
        this.loadChatMessages(this.interviewId!);
        this.isSavingMessage = false;
      },
      error: (error) => {
        console.error('Error updating message:', error);
        this.isSavingMessage = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.interviewId || this.isSendingMessage || !this.newMessageText.trim()) return;
    
    this.isSendingMessage = true;
    this.interviewService.createChatMessage(this.interviewId, {
      messageText: this.newMessageText.trim()
    }).subscribe({
      next: () => {
        this.newMessageText = '';
        this.loadChatMessages(this.interviewId!);
        this.isSendingMessage = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSendingMessage = false;
      }
    });
  }

  onMessageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
