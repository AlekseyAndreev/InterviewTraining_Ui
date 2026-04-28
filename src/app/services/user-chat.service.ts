import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GetUserChatMessagesWithAdminsResponse,
  SendUserChatMessageRequest,
  SendUserChatMessageResponse,
  EditUserChatMessageRequest,
  EditUserChatMessageResponse,
  DeleteUserChatMessageResponse,
  MarkUserChatMessageAsReadResponse
} from '../models/user-chat.model';
import { APP_CONFIG } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserChatService {
  private readonly config = inject(APP_CONFIG);

  constructor(private http: HttpClient) {}

  getMessagesWithAdmins(): Observable<GetUserChatMessagesWithAdminsResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/user-chat/messages/with-admins`;
    return this.http.get<GetUserChatMessagesWithAdminsResponse>(apiUrl);
  }

  sendMessage(request: SendUserChatMessageRequest): Observable<SendUserChatMessageResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/user-chat/messages`;
    return this.http.post<SendUserChatMessageResponse>(apiUrl, request);
  }

  editMessage(messageId: string, request: EditUserChatMessageRequest): Observable<EditUserChatMessageResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/user-chat/messages/${messageId}`;
    return this.http.put<EditUserChatMessageResponse>(apiUrl, request);
  }

  deleteMessage(messageId: string): Observable<DeleteUserChatMessageResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/user-chat/messages/${messageId}`;
    return this.http.delete<DeleteUserChatMessageResponse>(apiUrl);
  }

  markAsRead(messageId: string): Observable<MarkUserChatMessageAsReadResponse> {
    const apiUrl = `${this.config.api.baseUrl}/api/v1/user-chat/messages/${messageId}/read`;
    return this.http.post<MarkUserChatMessageAsReadResponse>(apiUrl, {});
  }
}