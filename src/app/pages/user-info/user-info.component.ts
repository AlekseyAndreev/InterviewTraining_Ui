import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { UserService } from '../../services/user.service';
import { SkillService } from '../../services/skill.service';
import { AvailableTimeService } from '../../services/available-time.service';
import { UserChatService } from '../../services/user-chat.service';
import { SnackbarService } from '../../services/snackbar.service';
import { GetUserInfoResponse } from '../../models/user-info.model';
import { SkillGroupDto } from '../../models/skill.model';
import { AvailableTimeDto } from '../../models/available-time.model';
import { UserChatMessageDto } from '../../models/user-chat.model';
import { UserSkillGroupComponent } from '../../components/user-skill-group/user-skill-group.component';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, UserSkillGroupComponent],
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

            @if (isAdmin) {
              <div class="chat-section">
                <h3 class="chat-title">{{ 'USER_CHAT.TITLE' | translate }}</h3>
                
                <div class="chat-messages" #chatMessagesContainer>
                  @if (isLoadingChatMessages) {
                    <div class="chat-loading">
                      <div class="spinner"></div>
                      <p>{{ 'USER_CHAT.LOADING_MESSAGES' | translate }}</p>
                    </div>
                  } @else {
                    @for (message of chatMessages; track message.id) {
                      <div class="chat-message" [ngClass]="getChatMessageClass(message)">
                        <div class="message-header">
                          <span class="message-from">{{ getChatMessageFromText(message) }}</span>
                          <span class="message-time">{{ formatChatMessageTime(message.created) }}</span>
                          @if (message.isEdited) {
                            <span class="message-edited">{{ 'USER_CHAT.EDITED' | translate }}</span>
                          }
                          @if (!message.isRead && isReceivedMessage(message)) {
                            <span class="message-unread-badge">{{ 'USER_CHAT.UNREAD' | translate }}</span>
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
                              <button class="btn-save-edit" (click)="saveEditChatMessage(message.id)" [disabled]="isSavingMessage || !editingMessageText.trim()">
                                @if (isSavingMessage) {
                                  {{ 'USER_CHAT.SAVING' | translate }}
                                } @else {
                                  {{ 'USER_CHAT.SAVE' | translate }}
                                }
                              </button>
                              <button class="btn-cancel-edit" (click)="cancelEditChatMessage()" [disabled]="isSavingMessage">
                                {{ 'USER_CHAT.CANCEL' | translate }}
                              </button>
                            </div>
                          </div>
                        } @else {
                          <div class="message-text">{{ message.messageText }}</div>
                          <div class="message-actions">
                            @if (isOwnMessage(message)) {
                              <button class="btn-edit-message" (click)="startEditChatMessage(message)">
                                {{ 'USER_CHAT.EDIT_MESSAGE' | translate }}
                              </button>
                              <button class="btn-delete-message" (click)="deleteChatMessage(message.id)">
                                {{ 'USER_CHAT.DELETE_MESSAGE' | translate }}
                              </button>
                            }
                            @if (!message.isRead && isReceivedMessage(message)) {
                              <button class="btn-mark-read" (click)="markChatMessageAsRead(message)">
                                {{ 'USER_CHAT.MARK_AS_READ' | translate }}
                              </button>
                            }
                          </div>
                        }
                      </div>
                    } @empty {
                      <div class="chat-empty-state">
                        <p class="chat-empty-text">{{ 'USER_CHAT.NO_MESSAGES' | translate }}</p>
                      </div>
                    }
                  }
                </div>
                
                <div class="chat-input-section">
                  <textarea
                    class="chat-input"
                    [(ngModel)]="newMessageText"
                    [placeholder]="'USER_CHAT.MESSAGE_PLACEHOLDER' | translate"
                    rows="2"
                    (keydown.enter)="onChatMessageKeydown($any($event))">
                  </textarea>
                  <button class="btn-send-message" (click)="sendChatMessage()" [disabled]="isSendingMessage || !newMessageText.trim()">
                    @if (isSendingMessage) {
                      {{ 'USER_CHAT.SENDING' | translate }}
                    } @else {
                      {{ 'USER_CHAT.SEND' | translate }}
                    }
                  </button>
                </div>
              </div>
            }
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
  private userChatService = inject(UserChatService);
  private snackbarService = inject(SnackbarService);
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

  isAdmin: boolean = false;
  chatMessages: UserChatMessageDto[] = [];
  isLoadingChatMessages = false;
  currentUserId: string | null = null;
  newMessageText: string = '';
  isSendingMessage = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  isSavingMessage = false;

  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;
  
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

    this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        this.currentUserId = userData?.sub || null;
        const roles = userData?.role;
        this.isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
        if (this.isAdmin && this.userId) {
          this.loadChatMessages();
        }
      }
    });
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

  private loadChatMessages(): void {
    if (!this.userId) return;
    this.isLoadingChatMessages = true;
    this.userChatService.getMessagesForAdmin(this.userId).subscribe({
      next: (response) => {
        this.chatMessages = response.messages || [];
        this.isLoadingChatMessages = false;
        setTimeout(() => this.scrollToChatBottom(), 0);
      },
      error: (error) => {
        console.error('Error loading chat messages:', error);
        this.isLoadingChatMessages = false;
      }
    });
  }

  private scrollToChatBottom(): void {
    if (this.chatMessagesContainer) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  isOwnMessage(message: UserChatMessageDto): boolean {
    return message.senderUserId === this.currentUserId;
  }

  isReceivedMessage(message: UserChatMessageDto): boolean {
    return message.receiverUserId === this.currentUserId;
  }

  getChatMessageClass(message: UserChatMessageDto): string {
    if (this.isOwnMessage(message)) {
      return 'message-own';
    }
    return 'message-other';
  }

  getChatMessageFromText(message: UserChatMessageDto): string {
    if (this.isOwnMessage(message)) {
      return this.translateService.instant('USER_CHAT.YOU');
    }
    return message.senderFullName || this.translateService.instant('USER_CHAT.ADMIN');
  }

  formatChatMessageTime(dateStr: string): string {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    return dateStr;
  }

  sendChatMessage(): void {
    if (this.isSendingMessage || !this.newMessageText.trim() || !this.userId) return;
    this.isSendingMessage = true;
    this.userChatService.sendMessage({
      receiverIdentityUserId: this.userId,
      messageText: this.newMessageText.trim()
    }).subscribe({
      next: () => {
        this.newMessageText = '';
        this.loadChatMessages();
        this.isSendingMessage = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_SENDING'));
        this.isSendingMessage = false;
      }
    });
  }

  onChatMessageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChatMessage();
    }
  }

  startEditChatMessage(message: UserChatMessageDto): void {
    this.editingMessageId = message.id;
    this.editingMessageText = message.messageText;
  }

  cancelEditChatMessage(): void {
    this.editingMessageId = null;
    this.editingMessageText = '';
  }

  saveEditChatMessage(messageId: string): void {
    if (this.isSavingMessage || !this.editingMessageText.trim()) return;
    this.isSavingMessage = true;
    this.userChatService.editMessage(messageId, {
      messageText: this.editingMessageText.trim()
    }).subscribe({
      next: () => {
        this.editingMessageId = null;
        this.editingMessageText = '';
        this.loadChatMessages();
        this.isSavingMessage = false;
      },
      error: (error) => {
        console.error('Error editing message:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_EDITING'));
        this.isSavingMessage = false;
      }
    });
  }

  deleteChatMessage(messageId: string): void {
    this.userChatService.deleteMessage(messageId).subscribe({
      next: () => {
        this.loadChatMessages();
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_DELETING'));
      }
    });
  }

  markChatMessageAsRead(message: UserChatMessageDto): void {
    this.userChatService.markAsRead(message.id).subscribe({
      next: () => {
        message.isRead = true;
        this.chatMessages = [...this.chatMessages];
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_MARKING_READ'));
      }
    });
  }
}