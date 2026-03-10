import { api } from "../http";

export interface GenerateTimeSlotsParams {
  startTime: string;
  endTime: string;
  blockDuration: number;
  intervalStart?: string;
  intervalDuration?: number;
  startDate: string;
  endDate: string;
  excludeDays?: number[];
  selectedOption?: {
    start: string;
    end: string;
  };
}

export interface TimeSlot {
  id: string;
  date: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: {
    message: string;
    options: Array<{
      start: string;
      end: string;
    }>;
  };
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
