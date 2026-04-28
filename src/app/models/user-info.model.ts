export interface TimeZoneDto {
  id: string;
  code: string;
  description: string;
}

export interface CurrencyDto {
  id: string;
  code: string;
  nameRu: string;
  nameEn: string;
}

export interface GetUserInfoResponse {
  photo: number[] | string | { $values?: number[] } | null;
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
  selectedTimeZoneId: string | null;
  timeZones: TimeZoneDto[];
  interviewPrice: number | null;
  currencyId: string | null;
  currencyCode: string | null;
  currencyNameRu: string | null;
  currencyNameEn: string | null;
}

export interface UpdateUserInfoRequest {
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
  interviewPrice: number | null;
  currencyId: string | null;
}

export interface UpdateUserInfoResponse {
  success: boolean;
}

export interface UpdateUserTimeZoneRequest {
  timeZoneId: string | null;
}

export interface UpdateUserTimeZoneResponse {
  success: boolean;
}

export interface AdminUserDto {
  id: string;
  identityUserId: string;
  fullName: string;
  isExpert: boolean;
  isCandidate: boolean;
  isDeleted: boolean;
}

export interface GetAllUsersForAdminResponse {
  data: AdminUserDto[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}