import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAllExpertsRequest, GetAllExpertsResponse } from '../models/expert.model';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private readonly apiUrl = 'http://localhost:54962/api/v1/experts';

  constructor(private http: HttpClient) {}

  getExperts(request: GetAllExpertsRequest): Observable<GetAllExpertsResponse> {
    return this.http.post<GetAllExpertsResponse>(this.apiUrl, request);
  }
}
