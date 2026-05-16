import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LlmService } from '../../services/llm.service';
import { AllLlmInterviewsResponse } from '../../models/llm.model';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-llm-interview',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, RouterModule],
  template: `
    <div class="llm-interview-container">
      <div class="chat-card">
        <div class="chat-header">
          <h1>{{ getInterviewTitle() }} ({{ 'LLM_INTERVIEW.TITLE_SUFFIX' | translate }})</h1>
          <button class="btn-back" (click)="goBack()">{{ 'LLM_INTERVIEW.BACK' | translate }}</button>
        </div>

        <div class="chat-messages" #chatMessagesContainer>
          @if (isStarting) {
            <div class="chat-loading">
              <div class="spinner"></div>
              <p>{{ 'LLM_INTERVIEW.STARTING' | translate }}</p>
            </div>
          } @else {
            @for (message of messages; track message.timestamp) {
              <div class="chat-message" [ngClass]="message.isUser ? 'message-own' : 'message-other'">
                <div class="message-header">
                  <span class="message-from">{{ message.isUser ? ('LLM_INTERVIEW.YOU' | translate) : ('LLM_INTERVIEW.AI' | translate) }}</span>
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.text }}</div>
              </div>
            } @empty {
              <div class="chat-empty-state">
                <p class="chat-empty-text">{{ 'LLM_INTERVIEW.NO_MESSAGES' | translate }}</p>
              </div>
            }
          }
        </div>

        @if (error) {
          <div class="chat-error">
            <span class="error-text">{{ error }}</span>
            <button class="btn-dismiss-error" (click)="error = null">✕</button>
          </div>
        }

        <div class="chat-input-section">
          <textarea
            class="chat-input"
            [(ngModel)]="userInput"
            [placeholder]="'LLM_INTERVIEW.MESSAGE_PLACEHOLDER' | translate"
            rows="2"
            (keydown.enter)="onMessageKeydown($any($event))"
            [disabled]="isStarting || isSending">
          </textarea>
          <button
            class="btn-send-message"
            (click)="sendMessage()"
            [disabled]="isSending || isStarting || !userInput.trim()">
            @if (isSending) {
              {{ 'LLM_INTERVIEW.SENDING' | translate }}
            } @else {
              {{ 'LLM_INTERVIEW.SEND' | translate }}
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .llm-interview-container {
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
      align-self: flex-end;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .message-own .message-from {
      color: rgba(255, 255, 255, 0.85);
    }

    .message-own .message-time {
      color: rgba(255, 255, 255, 0.7);
    }

    .message-own .message-text {
      color: white;
    }

    .message-other {
      align-self: flex-start;
      background: white;
      border: 1px solid #e8e8e8;
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

    .message-text {
      font-size: 0.95rem;
      color: #333;
      line-height: 1.4;
      white-space: pre-wrap;
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

    .chat-input:disabled {
      background: #f0f0f0;
      cursor: not-allowed;
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

    .chat-error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #fee2e2;
      border-top: 1px solid #fca5a5;
      gap: 0.5rem;
    }

    .chat-error .error-text {
      color: #b91c1c;
      font-size: 0.9rem;
    }

    .chat-error .btn-dismiss-error {
      background: transparent;
      border: none;
      color: #b91c1c;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .chat-error .btn-dismiss-error:hover {
      background: rgba(185, 28, 28, 0.1);
    }

    @media (max-width: 768px) {
      .llm-interview-container {
        padding: 1rem;
        margin: 1rem auto;
      }

      .chat-message {
        max-width: 90%;
      }
    }
  `]
})
export class LlmInterviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private llmService = inject(LlmService);
  private translateService = inject(TranslateService);

  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isStarting = false;
  isSending = false;
  error: string | null = null;

  private interviewType: number = 0;
  interview: AllLlmInterviewsResponse | null = null;

  private loadInterviewTitle(): void {
    this.llmService.getAllInterviews().subscribe({
      next: (interviews: AllLlmInterviewsResponse[]) => {
        this.interview = (interviews || []).find(i => i.interviewType === this.interviewType) || null;
      },
      error: () => {
        this.interview = null;
      }
    });
  }

  ngOnInit(): void {
    const typeParam = this.route.snapshot.paramMap.get('type');
    this.interviewType = typeParam ? parseInt(typeParam, 10) : 0;

    if (isNaN(this.interviewType) || this.interviewType <= 0) {
      this.error = this.translateService.instant('LLM_INTERVIEW.ERROR_INVALID_TYPE');
      return;
    }

    this.loadInterviewTitle();
    this.startInterview();
  }

  private startInterview(): void {
    this.isStarting = true;
    this.error = null;

    this.llmService.startInterview({ interviewType: this.interviewType }).subscribe({
      next: (response) => {
        this.messages.push({
          text: response.answer,
          isUser: false,
          timestamp: new Date()
        });
        this.isStarting = false;
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => {
        console.error('Error starting LLM interview:', err);
        this.error = this.translateService.instant('LLM_INTERVIEW.ERROR_STARTING');
        this.isStarting = false;
      }
    });
  }

  sendMessage(): void {
    if (this.isSending || !this.userInput.trim()) return;

    const userText = this.userInput.trim();
    this.messages.push({
      text: userText,
      isUser: true,
      timestamp: new Date()
    });
    this.userInput = '';
    this.isSending = true;
    this.error = null;

    setTimeout(() => this.scrollToBottom(), 0);

    this.llmService.ask({ userText: userText, interviewType: this.interviewType }).subscribe({
      next: (response) => {
        this.messages.push({
          text: response.answer,
          isUser: false,
          timestamp: new Date()
        });
        this.isSending = false;
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => {
        console.error('Error sending message to LLM:', err);
        this.error = this.translateService.instant('LLM_INTERVIEW.ERROR_SENDING');
        this.isSending = false;
      }
    });
  }

  onMessageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessageTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  private scrollToBottom(): void {
    if (this.chatMessagesContainer) {
      const container = this.chatMessagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  goBack(): void {
    this.router.navigate(['/expert-search']);
  }

  getInterviewTitle(): string {
    if (!this.interview) return '';
    return this.translateService.getCurrentLang() === 'ru' ? this.interview.interviewNameRu : this.interview.interviewNameEn;
  }
}
