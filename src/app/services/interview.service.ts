import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  GetMyInterviewsRequest, 
  GetMyInterviewsResponse, 
  CreateInterviewRequest, 
  CreateInterviewResponse,
  GetAllInterviewLanguagesResponse,
  GetInterviewInfoResponse,
  CancelInterviewRequest,
  CancelInterviewResponse,
  ConfirmInterviewResponse,
  RescheduleInterviewRequest,
  RescheduleInterviewResponse,
  CreateChatMessageRequest,
  CreateChatMessageResponse,
  UpdateChatMessageRequest,
  UpdateChatMessageResponse,
  GetChatMessagesResponse
} from '../models/interview.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private readonly config = inject(APP_CONFIG);
  
  constructor(private http: HttpClient) {}

  getMyInterviews(request: GetMyInterviewsRequest): Observable<GetMyInterviewsResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/my`;
    return this.http.post<GetMyInterviewsResponse>(apiUrl, request);
  }

  createInterview(request: CreateInterviewRequest): Observable<CreateInterviewResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews`;
    return this.http.post<CreateInterviewResponse>(apiUrl, request);
  }

  getInterviewLanguages(): Observable<GetAllInterviewLanguagesResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/languages`;
    return this.http.get<GetAllInterviewLanguagesResponse>(apiUrl);
  }

  getInterviewInfo(interviewId: string): Observable<GetInterviewInfoResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}`;
    return this.http.get<GetInterviewInfoResponse>(apiUrl);
  }

  cancelInterview(interviewId: string, request: CancelInterviewRequest): Observable<CancelInterviewResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}/cancel`;
    return this.http.post<CancelInterviewResponse>(apiUrl, request);
  }

  confirmInterview(interviewId: string): Observable<ConfirmInterviewResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}/confirm`;
    return this.http.post<ConfirmInterviewResponse>(apiUrl, {});
  }

  rescheduleInterview(interviewId: string, request: RescheduleInterviewRequest): Observable<RescheduleInterviewResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}/reschedule`;
    return this.http.put<RescheduleInterviewResponse>(apiUrl, request);
  }

  createChatMessage(interviewId: string, request: CreateChatMessageRequest): Observable<CreateChatMessageResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}/chat/messages`;
    return this.http.post<CreateChatMessageResponse>(apiUrl, request);
  }

  updateChatMessage(interviewId: string, messageId: string, request: UpdateChatMessageRequest): Observable<UpdateChatMessageResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}/chat/messages/${messageId}`;
    return this.http.put<UpdateChatMessageResponse>(apiUrl, request);
  }

  getChatMessages(interviewId: string): Observable<GetChatMessagesResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interviews/${interviewId}/chat/messages`;
    return this.http.get<GetChatMessagesResponse>(apiUrl);
  }
}
