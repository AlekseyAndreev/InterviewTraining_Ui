import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetUserInfoResponse, UpdateUserInfoRequest, UpdateUserInfoResponse, UpdateUserTimeZoneRequest, UpdateUserTimeZoneResponse  } from '../models/user-info.model';
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
    
    if (photo) {
      formData.append('photo', photo);
    }
    
    return this.http.put<UpdateUserInfoResponse>(apiUrl, formData);
  }

  updateUserTimeZone(request: UpdateUserTimeZoneRequest): Observable<UpdateUserTimeZoneResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users`;
    return this.http.put<UpdateUserTimeZoneResponse>(apiUrl, request);
  }
}
