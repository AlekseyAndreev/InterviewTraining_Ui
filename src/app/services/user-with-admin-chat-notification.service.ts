import { Injectable, inject, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { APP_CONFIG } from './config.service';
import {
  UserWithAdminChatMessageCreatedNotification,
  UserWithAdminChatMessageUpdatedNotification
} from '../models/user-chat.model';

@Injectable({
  providedIn: 'root'
})
export class UserWithAdminChatNotificationService implements OnDestroy {
  private readonly config = inject(APP_CONFIG);
  private hubConnection: HubConnection | null = null;

  private messageCreatedSubject = new Subject<UserWithAdminChatMessageCreatedNotification>();
  private messageUpdatedSubject = new Subject<UserWithAdminChatMessageUpdatedNotification>();

  messageCreated$ = this.messageCreatedSubject.asObservable();
  messageUpdated$ = this.messageUpdatedSubject.asObservable();

  private hubStarted = false;
  private currentUserId: string | null = null;

  private static getGroupName(userId: string): string {
    return `user_${userId}_with_admin_chat`;
  }

  startConnection(accessToken: string, userId: string): void {
    this.currentUserId = userId;
    this.startHub(accessToken);
  }

  private async joinGroup(userId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinUserWithAdminChat', userId);
      } catch (err) {
        console.error('Error joining user-with-admin-chat hub group:', err);
      }
    }
  }

  private async leaveGroup(userId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveUserWithAdminChat', userId);
      } catch (err) {
        console.error('Error leaving user-with-admin-chat hub group:', err);
      }
    }
  }

  private startHub(accessToken: string): void {
    if (this.hubStarted && this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const hubUrl = `${this.config.api.baseUrl}/hubs/user-with-admin-chat`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.min(retryContext.previousRetryCount * 2000, 10000);
          }
          return null;
        }
      })
      .build();

    this.hubConnection.on('UserWithAdminChatMessageCreated', (notification: UserWithAdminChatMessageCreatedNotification) => {
      this.messageCreatedSubject.next(notification);
    });

    this.hubConnection.on('UserWithAdminChatMessageUpdated', (notification: UserWithAdminChatMessageUpdatedNotification) => {
      this.messageUpdatedSubject.next(notification);
    });

    this.hubConnection.onclose(error => {
      this.hubStarted = false;
    });

    this.hubConnection.onreconnecting(error => {
      console.log('User-with-admin-chat hub reconnecting', error);
    });

    this.hubConnection.onreconnected(async (connectionId) => {
      this.hubStarted = true;
      if (this.currentUserId) {
        await this.joinGroup(this.currentUserId);
      }
    });

    this.hubConnection
      .start()
      .then(async () => {
        this.hubStarted = true;
        if (this.currentUserId) {
          await this.joinGroup(this.currentUserId);
        }
      })
      .catch(err => {
        console.error('Error starting user-with-admin-chat hub connection:', err);
      });
  }

  stopConnection(): void {
    if (this.currentUserId) {
      this.leaveGroup(this.currentUserId);
    }
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('User-with-admin-chat hub connection stopped');
          this.hubStarted = false;
        })
        .catch(err => {
          console.error('Error stopping user-with-admin-chat hub connection:', err);
        });
    }
  }

  ngOnDestroy(): void {
    this.stopConnection();
    this.messageCreatedSubject.complete();
    this.messageUpdatedSubject.complete();
  }
}
