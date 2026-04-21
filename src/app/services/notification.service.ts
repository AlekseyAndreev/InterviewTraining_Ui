import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserNotificationDto, GetUserNotificationsResponse } from '../models/notification.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly config = inject(APP_CONFIG);
  
  constructor(private http: HttpClient) {}

  getUserNotifications(): Observable<GetUserNotificationsResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/notifications`;
    return this.http.get<GetUserNotificationsResponse>(apiUrl);
  }

  deleteNotification(notificationId: string): Observable<void> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/notifications/${notificationId}`;
    return this.http.delete<void>(apiUrl);
  }

  markAsRead(notificationId: string): Observable<void> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/notifications/${notificationId}/read`;
    return this.http.put<void>(apiUrl, {});
  }

  markAsUnread(notificationId: string): Observable<void> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/users/me/notifications/${notificationId}/unread`;
    return this.http.put<void>(apiUrl, {});
  }
}
