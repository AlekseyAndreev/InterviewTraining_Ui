export interface InterviewDto {
  id: string;
  expertId: string;
  expertName: string;
  candidateId: string;
  candidateName: string;
  scheduledAt: string;
  status: InterviewStatus;
  statusDescription: string;
  notes: string | null;
}

export enum InterviewStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NoShow = 'NoShow'
}

export interface GetMyInterviewsRequest {
  pageNumber: number;
  pageSize: number;
  status?: InterviewStatus;
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
  fullName: string;
  photoUrl: string | null;
  shortDescription: string | null;
}

export interface ParticipantApprovalDto {
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

export interface GetInterviewInfoResponse {
  id: string;
  status: string;
  startDateTime: string;
  endDateTime: string | null;
  candidate: InterviewParticipantDto;
  expert: InterviewParticipantDto;
  language: InterviewLanguageInfoDto | null;
  linkToVideoCall: string | null;
  notes: string | null;
  candidateApproval: ParticipantApprovalDto;
  expertApproval: ParticipantApprovalDto;
  createdUtc: string;
}
