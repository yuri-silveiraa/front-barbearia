import { describe, expect, it } from "vitest";
import { formatName } from "../formatName";

describe("formatName", () => {
  it("formats names with proper capitalization", () => {
    expect(formatName("YuRi SiLVEIRA")).toBe("Yuri Silveira");
    expect(formatName("YURI PIRES")).toBe("Yuri Pires");
  });
});
