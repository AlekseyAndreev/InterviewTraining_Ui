export interface InterviewDto {
  id: string;
  expertId: string;
  expertName: string;
  candidateId: string;
  candidateName: string;
  scheduledAt: string;
  status: string;
  statusDescriptionRu: string;
  statusDescriptionEn: string;
  notes: string | null;
}

export interface GetMyInterviewsRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

export type GetMyInterviewsResponse = PagedResponse<InterviewDto>;

export interface CreateInterviewRequest {
  expertId: string;
  date: string;
  time: string;
  notes?: string;
  interviewLanguageId?: string | null;
}

export interface CreateInterviewResponse {
  id: string;
  success: boolean;
}

export interface InterviewLanguageDto {
  id: string;
  code: string;
  nameRu: string;
  nameEn: string;
}

export type GetAllInterviewLanguagesResponse = InterviewLanguageDto[];

export interface InterviewParticipantDto {
  id: string;
  identityUserId: string;
  fullName: string;
  photoUrl: string | null;
  shortDescription: string | null;
}

export interface ParticipantApprovalDto {
  isRescheduled: boolean;
  isApproved: boolean;
  isCancelled: boolean;
  cancelReason: string | null;
}

export interface InterviewLanguageInfoDto {
  id: string;
  code: string;
  nameRu: string;
  nameEn: string;
}

export interface ChatMessageDto {
  id: string;
  created: string;
  modified: string | null;
  text: string;
  from: ChatMessageFrom;
  isEdited: boolean;
}

export enum ChatMessageFrom {
  Unknown = 0,
  Candidate = 1,
  Expert = 2,
  Admin = 3,
  System = 4
}

export interface GetInterviewInfoResponse {
  id: string;
  status: string;
  statusDescriptionRu: string;
  statusDescriptionEn: string;
  startDateTime: string;
  endDateTime: string | null;
  interviewPrice: number | null;
  currencyNameRu: string | null;
  currencyNameEn: string | null;
  candidate: InterviewParticipantDto;
  expert: InterviewParticipantDto;
  language: InterviewLanguageInfoDto | null;
  linkToVideoCall: string | null;
  notes: string | null;
  candidateApproval: ParticipantApprovalDto;
  expertApproval: ParticipantApprovalDto;
  createdUtc: string;
}

export interface GetChatMessagesResponse {
  interviewId: string;
  messages: ChatMessageDto[];
}

export interface CreateChatMessageRequest {
  messageText: string;
}

export interface CreateChatMessageResponse {
  messageId: string;
  createdUtc: string;
  success: boolean;
}

export interface UpdateChatMessageRequest {
  messageText: string;
}

export interface UpdateChatMessageResponse {
  messageId: string;
  modifiedUtc: string;
  isEdited: boolean;
}

export interface CancelInterviewRequest {
  cancelReason?: string | null;
}

export interface CancelInterviewResponse {
  success: boolean;
}

export interface ConfirmInterviewResponse {
  interviewId: string;
  newVersionId: string;
  success: boolean;
}

export interface RescheduleInterviewRequest {
  newDate: string;
  newTime: string;
}

export interface RescheduleInterviewResponse {
  interviewId: string;
  newVersionId: string;
  success: boolean;
}
