import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LlmService } from '../../services/llm.service';
import { AllLlmInterviewsResponse } from '../../models/llm.model';

@Component({
  selector: 'app-llm-interviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div class="llm-interviews-container">
      <div class="llm-header">
        <h1>{{ 'LLM_INTERVIEWS.TITLE' | translate }}</h1>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'LLM_INTERVIEWS.LOADING' | translate }}</p>
        </div>
      }

      @if (error) {
        <div class="error-state">
          <p>{{ 'LLM_INTERVIEWS.ERROR' | translate }}</p>
        </div>
      }

      @if (!loading && !error && interviews.length > 0) {
        <div class="interviews-grid">
          @for (interview of interviews; track interview.interviewType) {
            <div class="interview-card">
              <div class="interview-avatar">
                {{ 'LLM_INTERVIEWS.AI' | translate }}
              </div>
              <div class="interview-info">
                <h3 class="interview-name">{{ getInterviewName(interview) }}</h3>
              </div>
              <div class="interview-actions">
                <button class="btn-start" (click)="startInterview(interview.interviewType)">
                  {{ 'LLM_INTERVIEWS.START' | translate }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading && !error && interviews.length === 0) {
        <div class="no-results">
          <p>{{ 'LLM_INTERVIEWS.NO_INTERVIEWS' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .llm-interviews-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
    }

    .llm-header {
      margin-bottom: 2rem;
    }

    .llm-header h1 {
      font-size: 2rem;
      color: #333;
      margin: 0;
    }

    .interviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .interview-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .interview-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .interview-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .interview-info {
      text-align: center;
    }

    .interview-name {
      font-size: 1.1rem;
      color: #333;
      margin: 0;
    }

    .interview-actions {
      width: 100%;
    }

    .btn-start {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-start:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p,
    .error-state p,
    .no-results p {
      color: #666;
      font-size: 1rem;
    }

    .error-state {
      text-align: center;
      padding: 2rem;
    }

    .no-results {
      text-align: center;
      padding: 3rem 1rem;
    }

    @media (max-width: 768px) {
      .llm-interviews-container {
        padding: 1rem;
        margin: 1rem auto;
      }

      .interviews-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LlmInterviewsComponent implements OnInit {
  interviews: AllLlmInterviewsResponse[] = [];
  loading = false;
  error = false;

  constructor(
    private llmService: LlmService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = false;

    this.llmService.getAllInterviews().subscribe({
      next: (response: AllLlmInterviewsResponse[]) => {
        this.interviews = response || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading LLM interviews:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  startInterview(type: number): void {
    this.router.navigate(['/llm-interview', type]);
  }

  getInterviewName(interview: AllLlmInterviewsResponse): string {
    return this.translateService.currentLang === 'ru' ? interview.interviewNameRu : interview.interviewNameEn;
  }
}
