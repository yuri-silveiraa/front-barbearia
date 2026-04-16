import { api } from "../http";

export interface GenerateTimeSlotsParams {
  startTime: string;
  endTime: string;
  intervalStart?: string;
  intervalDuration?: number;
  startDate: string;
  endDate: string;
  selectedDates?: string[];
  excludeDays?: number[];
}

export interface TimeSlot {
  id: string;
  date?: string;
  startAt: string;
  endAt: string;
  breakStartAt?: string | null;
  breakEndAt?: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface GenerateTimeSlotsResponse {
  timeSlots: TimeSlot[];
  validation: ValidationResult;
}

export async function generateTimeSlots(params: GenerateTimeSlotsParams): Promise<GenerateTimeSlotsResponse> {
  const { data } = await api.post<GenerateTimeSlotsResponse>("/time/generate", params);
  return data;
}

export async function getMyTimeSlots(): Promise<TimeSlot[]> {
  const { data } = await api.get<TimeSlot[]>("/time/my-times");
  return data;
}

export async function deleteTimeSlot(id: string): Promise<void> {
  await api.delete(`/time/${id}`);
}
