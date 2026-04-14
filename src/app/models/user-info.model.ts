export interface GetUserInfoResponse {
  photoUrl: string | null;
  photo: string | null;
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
}

export interface UpdateUserInfoRequest {
  photoUrl: string | null;
  photo: string | null;
  fullName: string | null;
  shortDescription: string | null;
  description: string | null;
}

export interface UpdateUserInfoResponse {
  success: boolean;
}
