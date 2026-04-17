export interface TimeZoneDto {
  id: string;
  code: string;
  description: string;
}

export interface GetUserInfoResponse {
  photo: number[] | null;
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
  selectedTimeZoneId: string | null;
  timeZones: TimeZoneDto[];
}

export interface UpdateUserInfoRequest {
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
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