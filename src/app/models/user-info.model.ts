export interface TimeZoneDto {
  id: string;
  code: string;
  description: string;
}

export interface GetUserInfoResponse {
  photoUrl: string | null;
  photo: string | null;
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
  selectedTimeZoneId: string | null;
  timeZones: TimeZoneDto[];
}

export interface UpdateUserInfoRequest {
  photoUrl: string | null;
  photo: string | null;
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
  selectedTimeZoneId: string | null;
}

export interface UpdateUserInfoResponse {
  success: boolean;
}
