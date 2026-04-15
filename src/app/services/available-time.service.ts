import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from './config.service';
import {
  AvailableTimeDto,
  CreateAvailableTimeRequest,
  CreateAvailableTimeResponse,
  UpdateAvailableTimeRequest,
  UpdateAvailableTimeResponse,
  DeleteAvailableTimeResponse,
  GetAvailableTimesResponse,
  GetExpertAvailableSlotsRequest,
  GetExpertAvailableSlotsResponse,
  BookSlotRequest,
  BookSlotResponse
} from '../models/available-time.model';

@Injectable({
  providedIn: 'root'
})
export class AvailableTimeService {
  private readonly config = inject(APP_CONFIG);

  constructor(private http: HttpClient) {}

  getAvailableTimes(): Observable<GetAvailableTimesResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/available-time`;
    return this.http.get<GetAvailableTimesResponse>(apiUrl);
  }

  createAvailableTime(request: CreateAvailableTimeRequest): Observable<CreateAvailableTimeResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/available-time`;
    return this.http.post<CreateAvailableTimeResponse>(apiUrl, request);
  }

  updateAvailableTime(id: string, request: UpdateAvailableTimeRequest): Observable<UpdateAvailableTimeResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/available-time/${id}`;
    return this.http.put<UpdateAvailableTimeResponse>(apiUrl, request);
  }

  deleteAvailableTime(id: string): Observable<DeleteAvailableTimeResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/available-time/${id}`;
    return this.http.delete<DeleteAvailableTimeResponse>(apiUrl);
  }

  getExpertAvailableSlots(expertId: string, request: GetExpertAvailableSlotsRequest): Observable<GetExpertAvailableSlotsResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/experts/${expertId}/available-slots`;
    const params = new HttpParams()
      .set('fromDate', request.fromDate)
      .set('toDate', request.toDate);
    return this.http.get<GetExpertAvailableSlotsResponse>(apiUrl, { params });
  }

  bookSlot(slotId: string, request: BookSlotRequest): Observable<BookSlotResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/interview-slots/${slotId}/book`;
    return this.http.post<BookSlotResponse>(apiUrl, request);
  }
}
