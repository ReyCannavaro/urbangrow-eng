import { describe, expect, it } from "bun:test";
import { SafetyInterlockManager } from "../safety";
import { SensorTelemetry } from "../types";

describe("SafetyInterlockManager Unit Tests", () => {
  const baseTelemetry: SensorTelemetry = {
    ph: 6.9,
    tds_ppm: 640,
    water_temp_c: 25.2,
    air_temp_c: 28.5,
    humidity_pct: 72,
    lux: 18000,
    dissolved_oxygen_mg_l: 6.0,
    water_level_ok: true,
  };

  it("should allow circulation pump when water level is OK", () => {
    const result = SafetyInterlockManager.canActivatePump(baseTelemetry);
    expect(result.allowed).toBe(true);
  });

  it("should block circulation pump when water level is dry/low", () => {
    const dryTelemetry: SensorTelemetry = {
      ...baseTelemetry,
      water_level_ok: false,
    };
    const result = SafetyInterlockManager.canActivatePump(dryTelemetry);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("POMPA DITAHAN");
  });

  it("should trigger aerator boost when DO drops below 5.0 mg/L", () => {
    const lowDoTelemetry: SensorTelemetry = {
      ...baseTelemetry,
      dissolved_oxygen_mg_l: 4.2,
    };
    const shouldBoost = SafetyInterlockManager.shouldBoostAerator(lowDoTelemetry);
    expect(shouldBoost).toBe(true);
  });

  it("should enforce exactly 3000ms feeder dispense duration", () => {
    expect(SafetyInterlockManager.getFeederDispenseDurationMs()).toBe(3000);
  });
});
