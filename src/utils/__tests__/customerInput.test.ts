import { describe, expect, it } from "vitest";
import { formatWhatsapp, normalizeCustomerName, onlyLettersAndSpaces } from "../customerInput";

describe("customerInput", () => {
  it("remove numeros do nome e normaliza capitalizacao", () => {
    expect(onlyLettersAndSpaces("YuRi123 SiLVEIRA")).toBe("YuRi SiLVEIRA");
    expect(normalizeCustomerName("YURI PIRES 123")).toBe("Yuri Pires");
  });

  it("formata WhatsApp para leitura no cadastro manual", () => {
    expect(formatWhatsapp("11912345678")).toBe("(11) 91234-5678");
    expect(formatWhatsapp("(11)91234")).toBe("(11) 91234");
  });
});
