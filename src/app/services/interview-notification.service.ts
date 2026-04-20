import { Injectable, inject, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { APP_CONFIG } from './config.service';
import { 
  InterviewVersionChangedNotification, 
  ChatMessageCreatedNotification, 
  ChatMessageUpdatedNotification 
} from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewNotificationService implements OnDestroy {
  private readonly config = inject(APP_CONFIG);
  private interviewHubConnection: HubConnection | null = null;
  private chatHubConnection: HubConnection | null = null;
  
  private interviewVersionChangedSubject = new Subject<InterviewVersionChangedNotification>();
  private chatMessageCreatedSubject = new Subject<ChatMessageCreatedNotification>();
  private chatMessageUpdatedSubject = new Subject<ChatMessageUpdatedNotification>();

  interviewVersionChanged$ = this.interviewVersionChangedSubject.asObservable();
  chatMessageCreated$ = this.chatMessageCreatedSubject.asObservable();
  chatMessageUpdated$ = this.chatMessageUpdatedSubject.asObservable();

  private interviewHubStarted = false;
  private chatHubStarted = false;
  private currentInterviewId: string | null = null;

  startConnection(accessToken: string, interviewId?: string): void {
    if (interviewId) {
      this.currentInterviewId = interviewId;
    }
    this.startInterviewHub(accessToken);
    this.startChatHub(accessToken);
  }

  joinInterviewGroup(interviewId: string): void {
    this.currentInterviewId = interviewId;
    this.joinInterviewHubGroup(interviewId);
    this.joinChatHubGroup(interviewId);
  }

  leaveInterviewGroup(interviewId: string): void {
    this.leaveInterviewHubGroup(interviewId);
    this.leaveChatHubGroup(interviewId);
  }

  private async joinInterviewHubGroup(interviewId: string): Promise<void> {
    if (this.interviewHubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.interviewHubConnection.invoke('JoinInterviewGroup', interviewId);
      } catch (err) {
        console.error('Error joining interview hub group:', err);
      }
    }
  }

  private async leaveInterviewHubGroup(interviewId: string): Promise<void> {
    if (this.interviewHubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.interviewHubConnection.invoke('LeaveInterviewGroup', interviewId);
      } catch (err) {
        console.error('Error leaving interview hub group:', err);
      }
    }
  }

  private async joinChatHubGroup(interviewId: string): Promise<void> {
    if (this.chatHubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.chatHubConnection.invoke('JoinInterviewChat', interviewId);
      } catch (err) {
        console.error('Error joining chat hub group:', err);
      }
    }
  }

  private async leaveChatHubGroup(interviewId: string): Promise<void> {
    if (this.chatHubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.chatHubConnection.invoke('LeaveInterviewChat', interviewId);
      } catch (err) {
        console.error('Error leaving chat hub group:', err);
      }
    }
  }

  private startInterviewHub(accessToken: string): void {
    if (this.interviewHubStarted && this.interviewHubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const hubUrl = `${this.config.api.baseUrl}/hubs/interview`;
    
    this.interviewHubConnection = new HubConnectionBuilder()
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

    this.interviewHubConnection.on('InterviewVersionChanged', (notification: InterviewVersionChangedNotification) => {
      this.interviewVersionChangedSubject.next(notification);
    });

    this.interviewHubConnection.onclose(error => {
      this.interviewHubStarted = false;
    });

    this.interviewHubConnection.onreconnecting(error => {
      console.log('Interview hub reconnecting', error);
    });

    this.interviewHubConnection.onreconnected(async (connectionId) => {
      this.interviewHubStarted = true;
      if (this.currentInterviewId) {
        await this.joinInterviewHubGroup(this.currentInterviewId);
      }
    });

    this.interviewHubConnection
      .start()
      .then(async () => {
        this.interviewHubStarted = true;
        if (this.currentInterviewId) {
          await this.joinInterviewHubGroup(this.currentInterviewId);
        }
      })
      .catch(err => {
        console.error('Error starting interview hub connection:', err);
      });
  }

  private startChatHub(accessToken: string): void {
    if (this.chatHubStarted && this.chatHubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const hubUrl = `${this.config.api.baseUrl}/hubs/interview-chat`;
    
    this.chatHubConnection = new HubConnectionBuilder()
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

    this.chatHubConnection.on('ChatMessageCreated', (notification: ChatMessageCreatedNotification) => {
      this.chatMessageCreatedSubject.next(notification);
    });

    this.chatHubConnection.on('ChatMessageUpdated', (notification: ChatMessageUpdatedNotification) => {
      this.chatMessageUpdatedSubject.next(notification);
    });

    this.chatHubConnection.onclose(error => {
      this.chatHubStarted = false;
    });

    this.chatHubConnection.onreconnecting(error => {
      console.log('Chat hub reconnecting', error);
    });

    this.chatHubConnection.onreconnected(async (connectionId) => {
      this.chatHubStarted = true;
      if (this.currentInterviewId) {
        await this.joinChatHubGroup(this.currentInterviewId);
      }
    });

    this.chatHubConnection
      .start()
      .then(async () => {
        this.chatHubStarted = true;
        if (this.currentInterviewId) {
          await this.joinChatHubGroup(this.currentInterviewId);
        }
      })
      .catch(err => {
        console.error('Error starting chat hub connection:', err);
      });
  }

  stopConnection(): void {
    if (this.currentInterviewId) {
      this.leaveInterviewGroup(this.currentInterviewId);
    }
    this.stopInterviewHub();
    this.stopChatHub();
  }

  private stopInterviewHub(): void {
    if (this.interviewHubConnection) {
      this.interviewHubConnection.stop()
        .then(() => {
          console.log('Interview hub connection stopped');
          this.interviewHubStarted = false;
        })
        .catch(err => {
          console.error('Error stopping interview hub connection:', err);
        });
    }
  }

  private stopChatHub(): void {
    if (this.chatHubConnection) {
      this.chatHubConnection.stop()
        .then(() => {
          console.log('Chat hub connection stopped');
          this.chatHubStarted = false;
        })
        .catch(err => {
          console.error('Error stopping chat hub connection:', err);
        });
    }
  }

  ngOnDestroy(): void {
    this.stopConnection();
    this.interviewVersionChangedSubject.complete();
    this.chatMessageCreatedSubject.complete();
    this.chatMessageUpdatedSubject.complete();
  }
}
