export enum AvailabilityType {
  AlwaysAvailable = 0,
  WeeklyFullDay = 1,
  WeeklyWithTime = 2,
  SpecificDateTime = 3
}

export interface AvailableTimeDto {
  id: string;
  availabilityType: AvailabilityType;
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string | null;
  endTime: string | null;
  displayTime: string;
}

export interface CreateAvailableTimeRequest {
  availabilityType: AvailabilityType;
  dayOfWeek?: number | null;
  specificDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  timeZoneId?: string | null;
}

export interface CreateAvailableTimeResponse {
  id: string;
  success: boolean;
}

export interface DeleteAvailableTimeResponse {
  success: boolean;
}

export interface GetAvailableTimesResponse {
  availableTimes: AvailableTimeDto[];
}

export interface InterviewSlotDto {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: SlotStatus;
  displayTime: string;
}

export enum SlotStatus {
  Available = 0,
  Booked = 1,
  Completed = 2,
  Cancelled = 3
}

export interface GetExpertAvailableSlotsRequest {
  fromDate: string;
  toDate: string;
}

export interface GetExpertAvailableSlotsResponse {
  expertTimeZone: string;
  slots: InterviewSlotDto[];
}

export interface BookSlotRequest {
  notes?: string;
}

export interface BookSlotResponse {
  success: boolean;
  interviewId: string;
}
