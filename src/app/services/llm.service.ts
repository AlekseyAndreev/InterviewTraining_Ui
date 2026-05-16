import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AllLlmInterviewsResponse,
  StartLlmRequest,
  StartLlmResponse,
  AskLlmRequest,
  AskLlmResponse
} from '../models/llm.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private readonly config = inject(APP_CONFIG);

  constructor(private http: HttpClient) {}

  getAllInterviews(): Observable<AllLlmInterviewsResponse[]> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/llm/all-interviews`;
    return this.http.get<AllLlmInterviewsResponse[]>(apiUrl);
  }

  startInterview(request: StartLlmRequest): Observable<StartLlmResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/llm/start`;
    return this.http.post<StartLlmResponse>(apiUrl, request);
  }

  ask(request: AskLlmRequest): Observable<AskLlmResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/llm/ask`;
    return this.http.post<AskLlmResponse>(apiUrl, request);
  }
}
