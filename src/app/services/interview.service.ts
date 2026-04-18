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
  CancelInterviewResponse
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
}
