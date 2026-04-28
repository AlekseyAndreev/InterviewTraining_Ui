import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { UserChatService } from '../../services/user-chat.service';
import { SnackbarService } from '../../services/snackbar.service';
import { UserChatMessageDto } from '../../models/user-chat.model';

@Component({
  selector: 'app-user-chat',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterModule],
  template: `
    <div class="user-chat-container">
      <div class="chat-card">
        <div class="chat-header">
          <h1>{{ 'USER_CHAT.TITLE' | translate }}</h1>
          <button class="btn-back" (click)="goBack()">{{ 'USER_CHAT.BACK' | translate }}</button>
        </div>

        <div class="chat-messages" #chatMessagesContainer>
          @if (isLoadingMessages) {
            <div class="chat-loading">
              <div class="spinner"></div>
              <p>{{ 'USER_CHAT.LOADING_MESSAGES' | translate }}</p>
            </div>
          } @else {
            @for (message of messages; track message.id) {
              <div class="chat-message" [ngClass]="getMessageClass(message)">
                <div class="message-header">
                  <span class="message-from">{{ getMessageFromText(message) }}</span>
                  <span class="message-time">{{ formatMessageTime(message.created) }}</span>
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
                      <button class="btn-save-edit" (click)="saveEditMessage(message.id)" [disabled]="isSavingMessage || !editingMessageText.trim()">
                        @if (isSavingMessage) {
                          {{ 'USER_CHAT.SAVING' | translate }}
                        } @else {
                          {{ 'USER_CHAT.SAVE' | translate }}
                        }
                      </button>
                      <button class="btn-cancel-edit" (click)="cancelEditMessage()" [disabled]="isSavingMessage">
                        {{ 'USER_CHAT.CANCEL' | translate }}
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="message-text">{{ message.messageText }}</div>
                  <div class="message-actions">
                    @if (isOwnMessage(message)) {
                      <button class="btn-edit-message" (click)="startEditMessage(message)">
                        {{ 'USER_CHAT.EDIT_MESSAGE' | translate }}
                      </button>
                      <button class="btn-delete-message" (click)="deleteMessage(message.id)">
                        {{ 'USER_CHAT.DELETE_MESSAGE' | translate }}
                      </button>
                    }
                    @if (!message.isRead && isReceivedMessage(message)) {
                      <button class="btn-mark-read" (click)="markAsRead(message)">
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
            (keydown.enter)="onMessageKeydown($any($event))">
          </textarea>
          <button class="btn-send-message" (click)="sendMessage()" [disabled]="isSendingMessage || !newMessageText.trim()">
            @if (isSendingMessage) {
              {{ 'USER_CHAT.SENDING' | translate }}
            } @else {
              {{ 'USER_CHAT.SEND' | translate }}
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-chat-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
    }

    .chat-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .chat-header h1 {
      color: white;
      font-size: 1.75rem;
      margin: 0;
    }

    .chat-header .btn-back {
      background: transparent;
      color: white;
      border: 2px solid white;
      padding: 0.5rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .chat-header .btn-back:hover {
      background: white;
      color: #667eea;
    }

    .chat-messages {
      max-height: 500px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8f9fa;
      min-height: 300px;
    }

    .chat-message {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      max-width: 80%;
      word-wrap: break-word;
    }

    .message-own {
      background: #e3f2fd;
      align-self: flex-start;
      border-left: 3px solid #1976d2;
    }

    .message-other {
      background: #f3e5f5;
      align-self: flex-end;
      border-right: 3px solid #7b1fa2;
      margin-left: auto;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .message-from {
      font-weight: 600;
      font-size: 0.85rem;
      color: #555;
    }

    .message-time {
      font-size: 0.75rem;
      color: #888;
    }

    .message-edited {
      font-size: 0.7rem;
      color: #999;
      font-style: italic;
    }

    .message-unread-badge {
      font-size: 0.7rem;
      background: #e74c3c;
      color: white;
      padding: 0.1rem 0.4rem;
      border-radius: 10px;
      font-weight: 500;
    }

    .message-text {
      font-size: 0.95rem;
      color: #333;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    .message-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-edit-message {
      background: transparent;
      color: #667eea;
      border: 1px solid #667eea;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-edit-message:hover {
      background: #667eea;
      color: white;
    }

    .btn-delete-message {
      background: transparent;
      color: #e74c3c;
      border: 1px solid #e74c3c;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-delete-message:hover {
      background: #e74c3c;
      color: white;
    }

    .btn-mark-read {
      background: transparent;
      color: #27ae60;
      border: 1px solid #27ae60;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-mark-read:hover {
      background: #27ae60;
      color: white;
    }

    .message-edit-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message-edit-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
      min-height: 60px;
    }

    .message-edit-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-save-edit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-save-edit:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-save-edit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel-edit {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cancel-edit:hover:not(:disabled) {
      background: #f0f0f0;
    }

    .btn-cancel-edit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .chat-input-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      border-top: 1px solid #e8e8e8;
    }

    .chat-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 60px;
      transition: border-color 0.3s ease;
    }

    .chat-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-send-message {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      align-self: flex-end;
    }

    .btn-send-message:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-send-message:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .chat-empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      min-height: 80px;
    }

    .chat-empty-text {
      color: #888;
      font-size: 0.95rem;
      font-style: italic;
      text-align: center;
      margin: 0;
    }

    .chat-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      gap: 0.75rem;
      min-height: 80px;
    }

    .chat-loading .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #e0e0e0;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .chat-loading p {
      color: #888;
      font-size: 0.9rem;
      margin: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .user-chat-container {
        padding: 1rem;
        margin: 1rem auto;
      }

      .chat-message {
        max-width: 90%;
      }

      .message-edit-actions {
        flex-direction: column;
      }

      .btn-save-edit,
      .btn-cancel-edit {
        width: 100%;
      }
    }
  `]
})
export class UserChatComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private userChatService = inject(UserChatService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  public oidcSecurityService = inject(OidcSecurityService);

  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  messages: UserChatMessageDto[] = [];
  isLoadingMessages = true;
  currentUserId: string | null = null;

  newMessageText: string = '';
  isSendingMessage = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  isSavingMessage = false;

  private authSubscription: any = null;

  ngOnInit(): void {
    this.authSubscription = this.oidcSecurityService.userData$.subscribe({
      next: ({ userData }) => {
        this.currentUserId = userData?.sub || null;
        if (this.currentUserId) {
          this.loadMessages();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private loadMessages(): void {
    this.isLoadingMessages = true;
    this.userChatService.getMessagesWithAdmins().subscribe({
      next: (response) => {
        this.messages = response.messages || [];
        this.isLoadingMessages = false;
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (error) => {
        console.error('Error loading chat messages:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_LOADING'));
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

  isOwnMessage(message: UserChatMessageDto): boolean {
    return message.senderUserId === this.currentUserId;
  }

  isReceivedMessage(message: UserChatMessageDto): boolean {
    return message.receiverUserId === this.currentUserId;
  }

  getMessageClass(message: UserChatMessageDto): string {
    if (this.isOwnMessage(message)) {
      return 'message-own';
    }
    return 'message-other';
  }

  getMessageFromText(message: UserChatMessageDto): string {
    if (this.isOwnMessage(message)) {
      return this.translateService.instant('USER_CHAT.YOU');
    }
    return message.senderFullName || this.translateService.instant('USER_CHAT.ADMIN');
  }

  formatMessageTime(dateStr: string): string {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    return dateStr;
  }

  sendMessage(): void {
    if (this.isSendingMessage || !this.newMessageText.trim()) return;

    this.isSendingMessage = true;
    this.userChatService.sendMessage({
      receiverIdentityUserId: null,
      messageText: this.newMessageText.trim()
    }).subscribe({
      next: () => {
        this.newMessageText = '';
        this.loadMessages();
        this.isSendingMessage = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_SENDING'));
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

  startEditMessage(message: UserChatMessageDto): void {
    this.editingMessageId = message.id;
    this.editingMessageText = message.messageText;
  }

  cancelEditMessage(): void {
    this.editingMessageId = null;
    this.editingMessageText = '';
  }

  saveEditMessage(messageId: string): void {
    if (this.isSavingMessage || !this.editingMessageText.trim()) return;

    this.isSavingMessage = true;
    this.userChatService.editMessage(messageId, {
      messageText: this.editingMessageText.trim()
    }).subscribe({
      next: () => {
        this.editingMessageId = null;
        this.editingMessageText = '';
        this.loadMessages();
        this.isSavingMessage = false;
      },
      error: (error) => {
        console.error('Error editing message:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_EDITING'));
        this.isSavingMessage = false;
      }
    });
  }

  deleteMessage(messageId: string): void {
    this.userChatService.deleteMessage(messageId).subscribe({
      next: () => {
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_DELETING'));
      }
    });
  }

  markAsRead(message: UserChatMessageDto): void {
    this.userChatService.markAsRead(message.id).subscribe({
      next: () => {
        message.isRead = true;
        this.messages = [...this.messages];
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
        this.snackbarService.showError(this.translateService.instant('USER_CHAT.ERROR_MARKING_READ'));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}