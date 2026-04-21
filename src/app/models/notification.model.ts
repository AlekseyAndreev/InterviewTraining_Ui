export interface UserNotificationDto {
  id: string;
  isRead: boolean;
  text: string;
  created: string;
}

export interface GetUserNotificationsResponse {
  notifications: UserNotificationDto[];
}
