export interface UserNotificationDto {
  id: string;
  isRead: boolean;
  text: string;
  created: string;
  linkType: string;
  linkId: string;
}

export interface GetUserNotificationsResponse {
  notifications: UserNotificationDto[];
}
