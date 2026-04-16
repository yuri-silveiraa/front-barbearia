import { describe, expect, it } from "vitest";
import { buildGenerateTimeSlotsParams } from "../timeSlotGeneration";

const config = {
  startTime: "08:00",
  endTime: "21:00",
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

  it("não envia duração de bloco porque a duração vem do serviço", () => {
    const params = buildGenerateTimeSlotsParams(config, ["2026-04-10"]);

    expect(params).not.toHaveProperty("blockDuration");
    expect(params).not.toHaveProperty("confirmRemainder");
  });

  it("envia intervalo somente quando a jornada tem pausa", () => {
    const params = buildGenerateTimeSlotsParams({
      ...config,
      hasInterval: true,
    }, ["2026-04-10"]);

    expect(params).toMatchObject({
      intervalStart: "12:00",
      intervalDuration: 60,
    });
  });
});
