export enum LlmInterviewType {
  Unknown = 0,
  Dotnet = 1,
  Analyst = 2
}

export interface AllLlmInterviewsResponse {
  interviewNameRu: string;
  interviewNameEn: string;
  interviewType: number;
}

export interface StartLlmRequest {
  interviewType: number;
}

export interface StartLlmResponse {
  answer: string;
}

export interface AskLlmRequest {
  userText: string;
  interviewType: number;
}

export interface AskLlmResponse {
  answer: string;
}
