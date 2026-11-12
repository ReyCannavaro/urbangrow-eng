import { BackendTelemetrySnapshot, HistorySample, SensorData } from "./types";

export const ACTIVE_STREAM_GAP_MS = 120_000;

export function hasAnyNumericSensor(s: SensorData | undefined): boolean {
  if (!s) return false;
  return Object.values(s).some((v) => typeof v === "number" && Number.isFinite(v));
}

export function isTelemetrySnapshotLive(
  snap: Pick<BackendTelemetrySnapshot, "sensors" | "system"> | undefined | null
): boolean {
  if (!snap) return false;
  const deviceOrSensorsActive =
    Boolean(snap.system?.edgeOnline) || (snap.system?.liveSensorCount ?? 0) > 0;
  return deviceOrSensorsActive && hasAnyNumericSensor(snap.sensors);
}

export function extractActiveStreamHistory(
  samples: HistorySample[],
  anchorNowMs: number = Date.now()
): HistorySample[] {
  if (!Array.isArray(samples) || samples.length === 0) return [];

  const validSorted = samples
    .filter(
      (sample) =>
        sample &&
        typeof sample.timestamp === "string" &&
        Number.isFinite(Date.parse(sample.timestamp)) &&
        hasAnyNumericSensor(sample.sensors)
    )
    .slice()
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

  if (validSorted.length === 0) return [];

  const tail: HistorySample[] = [];
  for (let i = validSorted.length - 1; i >= 0; i--) {
    const item = validSorted[i];
    const itemMs = Date.parse(item.timestamp);

    if (tail.length === 0) {
      if (anchorNowMs - itemMs > ACTIVE_STREAM_GAP_MS) {
        return [];
      }
      tail.unshift(item);
    } else {
      const nextMs = Date.parse(tail[0].timestamp);
      if (nextMs - itemMs > ACTIVE_STREAM_GAP_MS) {
        break;
      }
      tail.unshift(item);
    }

    if (tail.length >= 60) break;
  }

  return tail;
}

export function mergeActiveHistory(
  existing: HistorySample[],
  incomingDb: HistorySample[],
  anchorNowMs: number
): HistorySample[] {
  const combined = [...existing];
  for (const item of incomingDb) {
    const itemMs = Date.parse(item.timestamp);
    if (!Number.isFinite(itemMs)) continue;
    const isDuplicate = combined.some((prev) => {
      if (prev.timestamp === item.timestamp) return true;
      const prevMs = Date.parse(prev.timestamp);
      return Number.isFinite(prevMs) && Math.abs(prevMs - itemMs) < 800;
    });
    if (!isDuplicate) {
      combined.push(item);
    }
  }
  return extractActiveStreamHistory(combined, anchorNowMs);
}
