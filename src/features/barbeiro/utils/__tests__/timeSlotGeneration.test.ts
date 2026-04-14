import { describe, expect, it } from "vitest";
import { buildGenerateTimeSlotsParams, getRemainderWarningText } from "../timeSlotGeneration";

const config = {
  startTime: "08:00",
  endTime: "21:00",
  blockDuration: 45,
  hasInterval: false,
  intervalStart: "12:00",
  intervalDuration: 60,
};

describe("timeSlotGeneration", () => {
  it("envia exatamente os dias selecionados, mesmo quando não são contínuos", () => {
    const params = buildGenerateTimeSlotsParams(config, ["2026-04-10", "2026-04-01"]);

    expect(params).toMatchObject({
      startDate: "2026-04-01",
      endDate: "2026-04-10",
      selectedDates: ["2026-04-01", "2026-04-10"],
    });
  });

  it("inclui confirmação de sobra somente quando o barbeiro prossegue", () => {
    expect(buildGenerateTimeSlotsParams(config, ["2026-04-10"])?.confirmRemainder).toBeUndefined();
    expect(buildGenerateTimeSlotsParams(config, ["2026-04-10"], true)?.confirmRemainder).toBe(true);
  });

  it("monta texto de aviso de sobra com último horário completo", () => {
    const text = getRemainderWarningText({
      isValid: true,
      warning: {
        message: "Sobrarão 15 minutos.",
        remainderMinutes: 15,
        lastBlockEnd: "20:45",
      },
    });

    expect(text).toContain("Sobrarão 15 minutos.");
    expect(text).toContain("20:45");
  });
});
