import { describe, expect, it } from "vitest";
import { estimateSolar } from "./calculator";
describe("solar estimator", () => {
  it("returns bounded positive planning estimates", () => {
    const result = estimateSolar(4_000, 8);
    expect(result.capacityKw).toBeGreaterThan(0);
    expect(result.annualGeneration).toBeGreaterThan(0);
    expect(result.annualSavings).toBeGreaterThan(0);
  });
  it("handles invalid negative bills safely", () => {
    expect(estimateSolar(-100, 0).capacityKw).toBe(0.5);
  });
});
