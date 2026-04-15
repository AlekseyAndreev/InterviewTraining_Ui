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
