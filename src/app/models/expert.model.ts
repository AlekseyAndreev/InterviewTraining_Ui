export interface GetExpertResponse {
  id: string;
  identityServerId: string;
  fullName: string;
}

export interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

export type GetAllExpertsResponse = PagedResponse<GetExpertResponse>;

export interface GetAllExpertsRequest {
  pageNumber: number;
  pageSize: number;
}
