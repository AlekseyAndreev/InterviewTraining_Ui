import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAllExpertsRequest, GetAllExpertsResponse } from '../models/expert.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private readonly config = inject(APP_CONFIG);
  
  constructor(private http: HttpClient) {}

  getExperts(request: GetAllExpertsRequest): Observable<GetAllExpertsResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/experts`;
    return this.http.post<GetAllExpertsResponse>(apiUrl, request);
  }
}
