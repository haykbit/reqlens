import { describe, expect, it } from "vitest";

import { localize, ui, viewLabel } from "@/lib/i18n";

describe("localized product copy", () => {
  it("selects the requested locale", () => {
    expect(localize({ en: "Evidence", es: "Evidencia" }, "es")).toBe("Evidencia");
  });

  it("provides a label for every view", () => {
    expect(ui(viewLabel.replay, "en")).toBe("Replay");
    expect(ui(viewLabel.activity, "es")).toBe("Actividad");
  });
});
