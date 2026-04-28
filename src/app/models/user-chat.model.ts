export interface UserChatMessageDto {
  id: string;
  senderUserId: string;
  senderFullName: string;
  receiverUserId: string;
  receiverFullName: string;
  messageText: string;
  isEdited: boolean;
  isRead: boolean;
  created: string;
}

export interface GetUserChatMessagesWithAdminsResponse {
  messages: UserChatMessageDto[];
}

export interface SendUserChatMessageRequest {
  receiverIdentityUserId: string | null;
  messageText: string;
}

export interface SendUserChatMessageResponse {
  messageId: string;
  createdUtc: string;
}

export interface EditUserChatMessageRequest {
  messageText: string;
}

export interface EditUserChatMessageResponse {
  messageId: string;
  updatedUtc: string;
  isEdited: boolean;
}

export interface DeleteUserChatMessageResponse {
  success: boolean;
  messageId: string;
}

export interface MarkUserChatMessageAsReadResponse {
  success: boolean;
}