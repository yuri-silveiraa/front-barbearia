import type { GenerateTimeSlotsParams, ValidationResult } from "../../../api/time/time.service";

export interface TimeGenerationConfig {
  startTime: string;
  endTime: string;
  hasInterval: boolean;
  intervalStart: string;
  intervalDuration: number;
}

export function buildGenerateTimeSlotsParams(
  config: TimeGenerationConfig,
  selectedDays: string[],
): GenerateTimeSlotsParams | null {
  if (selectedDays.length === 0) {
    return null;
  }

  const sortedDays = Array.from(new Set(selectedDays)).sort();
  const params: GenerateTimeSlotsParams = {
    startTime: config.startTime,
    endTime: config.endTime,
    startDate: sortedDays[0],
    endDate: sortedDays[sortedDays.length - 1],
    selectedDates: sortedDays,
  };

  if (config.hasInterval) {
    params.intervalStart = config.intervalStart;
    params.intervalDuration = config.intervalDuration;
  }
  return params;
}

export function getRemainderWarningText(validation: ValidationResult): string {
  return validation.error ?? "";
}
