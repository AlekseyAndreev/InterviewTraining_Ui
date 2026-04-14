import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetUserInfoResponse, UpdateUserInfoRequest, UpdateUserInfoResponse } from '../models/user-info.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly config = inject(APP_CONFIG);
  
  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<GetUserInfoResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users`;
    return this.http.get<GetUserInfoResponse>(apiUrl);
  }

  updateUserInfo(request: UpdateUserInfoRequest): Observable<UpdateUserInfoResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users`;
    return this.http.put<UpdateUserInfoResponse>(apiUrl, request);
  }
}
