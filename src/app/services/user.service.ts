import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetUserInfoResponse, UpdateUserInfoRequest, UpdateUserInfoResponse, UpdateUserTimeZoneRequest, UpdateUserTimeZoneResponse, CurrencyDto, GetAllUsersForAdminResponse } from '../models/user-info.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly config = inject(APP_CONFIG);
  
  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<GetUserInfoResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users`;
    console.log('getUserInfo request to:', apiUrl);
    return this.http.get<GetUserInfoResponse>(apiUrl);
  }

  getUserInfoById(userId: string): Observable<GetUserInfoResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/${userId}`;
    return this.http.get<GetUserInfoResponse>(apiUrl);
  }

  updateUserInfo(request: UpdateUserInfoRequest, photo: File | null): Observable<UpdateUserInfoResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users`;
    
    const formData = new FormData();
    formData.append('fullName', request.fullName || '');
    formData.append('shortDescription', request.shortDescription || '');
    formData.append('description', request.description || '');
    
    if (request.interviewPrice !== null && request.interviewPrice !== undefined) {
      formData.append('interviewPrice', request.interviewPrice.toString());
    }
    
    if (request.currencyId) {
      formData.append('currencyId', request.currencyId);
    }
    
    if (photo) {
      formData.append('photo', photo);
    }
    
    return this.http.put<UpdateUserInfoResponse>(apiUrl, formData);
  }

  updateUserTimeZone(request: UpdateUserTimeZoneRequest): Observable<UpdateUserTimeZoneResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users`;
    return this.http.put<UpdateUserTimeZoneResponse>(apiUrl, request);
  }

  getAllCurrencies(): Observable<CurrencyDto[]> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/currencies`;
    return this.http.get<CurrencyDto[]>(apiUrl);
  }

  getAllUsers(pageNumber: number = 1, pageSize: number = 20, searchFilter: string | null = null): Observable<GetAllUsersForAdminResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/all`;
    let params: any = { pageNumber, pageSize };
    if (searchFilter) {
      params.searchFilter = searchFilter;
    }
    return this.http.get<GetAllUsersForAdminResponse>(apiUrl, { params });
  }
}
