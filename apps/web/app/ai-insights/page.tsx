"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  RefreshCw,
  SlidersHorizontal,
  Power,
  Check,
} from "lucide-react";
import { useTelemetry } from "../../lib/telemetryContext";
import { ClimateScoreCard } from "../../components/ai/ClimateScoreCard";
import { HarvestCountdownCard } from "../../components/ai/HarvestCountdownCard";
import { FishHarvestCard } from "../../components/ai/FishHarvestCard";
import { PredictionSetupModal } from "../../components/ai/PredictionSetupModal";
import { RevealOnView } from "../../components/motion/RevealOnView";
import {
  fetchClimateScore,
  fetchAnomalyInference,
  fetchAgriBotDiagnostics,
  savePredictionCohort,
  getDefaultPredictionCohort,
  readStoredPredictionCohort,
  computeLocalFishForecast,
  computeLocalSeedCropForecast,
  formatIndonesianDate,
  ClimateScoreData,
  AnomalyPrediction,
} from "../../lib/aiApi";
import {
  EcosystemDiagnosticReport,
  PredictionCohortConfig,
  SensorData,
} from "../../lib/types";

const DEFAULT_FALLBACK_SENSORS: SensorData = {
  ph: null,
  tds: null,
  waterTemperature: null,
  airTemperature: null,
  humidity: null,
  lightIntensity: null,
  dissolvedOxygen: null,
  waterLevel: null,
};

let cachedCohortSnapshot: PredictionCohortConfig | null = null;
let cachedCohortRaw: string | null = null;
const DEFAULT_COHORT_SNAPSHOT = getDefaultPredictionCohort();
const cohortListeners = new Set<() => void>();

function subscribeCohortStorage(callback: () => void) {
  cohortListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === "urbangrow_prediction_cohort_v1") {
      cachedCohortRaw = null;
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    cohortListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getCohortSnapshot(): PredictionCohortConfig {
  if (typeof window === "undefined") return DEFAULT_COHORT_SNAPSHOT;
  const raw = window.localStorage.getItem("urbangrow_prediction_cohort_v1");
  if (raw === cachedCohortRaw && cachedCohortSnapshot) {
    return cachedCohortSnapshot;
  }
  cachedCohortRaw = raw;
  cachedCohortSnapshot = readStoredPredictionCohort() ?? DEFAULT_COHORT_SNAPSHOT;
  return cachedCohortSnapshot;
}

function getServerCohortSnapshot(): PredictionCohortConfig {
  return DEFAULT_COHORT_SNAPSHOT;
}

function notifyCohortUpdated() {
  cachedCohortRaw = null;
  cohortListeners.forEach((fn) => fn());
}

export default function AiInsightsPage() {
  const { actuators, setActuatorState, systemMeta } = useTelemetry();
  const storedCohort = useSyncExternalStore(
    subscribeCohortStorage,
    getCohortSnapshot,
    getServerCohortSnapshot
  );

  const [climateData, setClimateData] = useState<ClimateScoreData | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyPrediction | null>(null);
  const [diagnostics, setDiagnostics] = useState<EcosystemDiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const loadData = async () => {
    setLoading(true);
    const [c, a, d] = await Promise.all([
      fetchClimateScore(),
      fetchAnomalyInference(),
      fetchAgriBotDiagnostics(),
    ]);
    setClimateData(c);
    setAnomaly(a);
    setDiagnostics(d);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    async function syncInsights() {
      const [c, a, d] = await Promise.all([
        fetchClimateScore(),
        fetchAnomalyInference(),
        fetchAgriBotDiagnostics(),
      ]);
      if (cancelled) return;
      setClimateData(c);
      setAnomaly(a);
      setDiagnostics(d);
      setLoading(false);
    }

    void syncInsights();
    const interval = setInterval(() => {
      void syncInsights();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleOpenSetup = () => {
    setModalKey((k) => k + 1);
    setIsSetupOpen(true);
  };

  const handleSaveCohort = async (updated: PredictionCohortConfig) => {
    await savePredictionCohort(updated);
    notifyCohortUpdated();
    await loadData();
  };

  const activeCohort = storedCohort;
  const liveSensors = diagnostics?.sensors ?? DEFAULT_FALLBACK_SENSORS;

  const pakcoy =
    diagnostics?.predictions.harvest.pakcoy ??
    computeLocalSeedCropForecast("pakcoy", activeCohort.pakcoy, liveSensors);
  const kangkung =
    diagnostics?.predictions.harvest.kangkung ??
    computeLocalSeedCropForecast("kangkung", activeCohort.kangkung, liveSensors);

  const showNila = activeCohort.fishMode === "both" || activeCohort.fishMode === "nila";
  const showLele = activeCohort.fishMode === "both" || activeCohort.fishMode === "lele";

  const nilaForecast = showNila
    ? diagnostics?.predictions.fish?.nila ??
      computeLocalFishForecast(activeCohort.nila, liveSensors)
    : undefined;
  const leleForecast = showLele
    ? diagnostics?.predictions.fish?.lele ??
      computeLocalFishForecast(activeCohort.lele, liveSensors)
    : undefined;

  const cleanRecommendedAction = anomaly?.recommended_action
    ? anomaly.recommended_action.toLowerCase().includes("ai engine offline")
      ? "Mode heuristik ECAD aktif: pemantauan parameter pH, suhu air, TDS, iklim mikro, dan cahaya berjalan otomatis."
      : anomaly.recommended_action.replace(/,?\s*Δ?DO\s*[^,.)]+/gi, "")
    : "";

  const cleanWaterForecast = diagnostics?.predictions.trends.waterForecast
    ? diagnostics.predictions.trends.waterForecast
        .replace(/,?\s*Δ?DO\s*[+-]?\d+(?:\.\d+)?\s*mg\/L/gi, "")
        .replace(/,?\s*oksigen terlarut[^,.)]*/gi, "")
    : "";

  return (
    <div className="space-y-6">
      {/* Header matching Pine Executive Dashboard */}
      <section
        style={{ "--ug-delay": "0ms" } as React.CSSProperties}
        className="ug-enter flex flex-col justify-between gap-4 pb-1 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Prediksi Panen &amp; Inteligensi AI
          </h1>
          <p className="mt-1 text-xs text-[#6B7280]">
            Proyeksi siap panen budidaya ikan (Nila / Lele), sayuran (Pakcoy &amp; Kangkung), dan skor adaptasi iklim.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenSetup}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#165B39] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#124B2E] cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Setup Data Prediksi</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#111827] shadow-2xs transition-colors hover:bg-[#F9FAFB] hover:border-[#D1D5DB] cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#165B39] ${loading ? "animate-spin" : ""}`}
            />
            <span>Perbarui Prediksi</span>
          </button>
        </div>
      </section>

      {/* Slim Single-Line Telemetry Calibration Notice */}
      <div
        style={{ "--ug-delay": "50ms" } as React.CSSProperties}
        className={`ug-enter flex items-center gap-2.5 rounded-[18px] border px-4 py-2.5 text-xs ${
          systemMeta.edgeOnline && systemMeta.liveSensorCount > 0
            ? "border-[#165B39]/20 bg-[#DCFCE7]/40 text-[#166534]"
            : "border-[#E5E7EB] bg-white text-[#4B5563]"
        }`}
      >
        {systemMeta.edgeOnline && systemMeta.liveSensorCount > 0 ? (
          <CheckCircle2 className="h-4 w-4 text-[#165B39] shrink-0" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-[#9CA3AF] shrink-0" />
        )}
        <span>
          {systemMeta.edgeOnline && systemMeta.liveSensorCount > 0
            ? `Model GDD dan ADG ikan terkalibrasi oleh ${systemMeta.liveSensorCount}/4 sensor fisik live (${systemMeta.edgeNode}).`
            : `Maaf, alat sedang offline — proyeksi panen mengacu pada baseline kalibrasi data tebar & semai benih Anda.`}
        </span>
      </div>

      {/* Section 1: Prediksi Panen Ikan */}
      <section
        style={{ "--ug-delay": "100ms" } as React.CSSProperties}
        className="ug-enter space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#111827]">
            Proyeksi Pertumbuhan &amp; Panen Ikan
          </h2>
          <span className="text-xs text-[#6B7280]">
            Dihitung dari panjang tebar, tanggal tebar &amp; suhu air
          </span>
        </div>

        <div
          className={`grid grid-cols-1 gap-5 ${
            nilaForecast && leleForecast ? "lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {nilaForecast && <FishHarvestCard forecast={nilaForecast} />}
          {leleForecast && <FishHarvestCard forecast={leleForecast} />}
        </div>
      </section>

      {/* Section 2: Prediksi Panen Sayuran */}
      <RevealOnView delayMs={0}>
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#111827]">
              Proyeksi Panen Sayuran Vertikal
            </h2>
            <span className="text-xs text-[#6B7280]">
              Model GDD sejak tanggal semai benih
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <HarvestCountdownCard
              cropName="pakcoy"
              daysToHarvest={pakcoy.estimatedDaysRemaining}
              accumulatedGdd={pakcoy.accumulatedGdd}
              targetGdd={pakcoy.targetGdd}
              projectedBiomassGrams={pakcoy.projectedBiomassGrams}
              growthStage={pakcoy.growthStage}
              seedingDate={pakcoy.seedingDate}
              daysSincePlanting={pakcoy.daysSincePlanting}
              estimatedHarvestDate={pakcoy.estimatedHarvestDate}
              plantCount={pakcoy.plantCount}
              projectedTotalYieldKg={pakcoy.projectedTotalYieldKg}
              lightEfficiencyPct={pakcoy.lightEfficiencyPct}
            />
            <HarvestCountdownCard
              cropName="kangkung"
              daysToHarvest={kangkung.estimatedDaysRemaining}
              accumulatedGdd={kangkung.accumulatedGdd}
              targetGdd={kangkung.targetGdd}
              projectedBiomassGrams={kangkung.projectedBiomassGrams}
              growthStage={kangkung.growthStage}
              seedingDate={kangkung.seedingDate}
              daysSincePlanting={kangkung.daysSincePlanting}
              estimatedHarvestDate={kangkung.estimatedHarvestDate}
              plantCount={kangkung.plantCount}
              projectedTotalYieldKg={kangkung.projectedTotalYieldKg}
              lightEfficiencyPct={kangkung.lightEfficiencyPct}
            />
          </div>
        </section>
      </RevealOnView>

      {/* Section 3: Climate Adaptation Score & AI Advisory */}
      <RevealOnView delayMs={80}>
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {climateData && <ClimateScoreCard data={climateData} />}

          {anomaly && (
            <div className="flex flex-col justify-between rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
              <div>
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3.5">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">
                      Rekomendasi Tindakan Adaptif
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Evaluasi AI berdasarkan tren sensor dan status aktuator
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      anomaly.risk_level === "OFFLINE"
                        ? "bg-[#F3F4F6] text-[#6B7280]"
                        : anomaly.risk_level === "CRITICAL"
                        ? "bg-rose-50 text-rose-700"
                        : anomaly.is_anomaly
                        ? "bg-[#FEF3C7] text-[#B45309]"
                        : "bg-[#DCFCE7] text-[#166534]"
                    }`}
                  >
                    {anomaly.risk_level === "OFFLINE" ? "Offline" : anomaly.risk_level}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#374151]">
                  {cleanRecommendedAction}
                </p>

                {cleanWaterForecast && (
                  <div className="mt-4 pt-4 border-t border-[#F3F4F6] text-xs leading-relaxed text-[#4B5563]">
                    <span className="mb-1 block font-semibold text-[#111827]">
                      Proyeksi Biofilter 24 Jam
                    </span>
                    {cleanWaterForecast}
                  </div>
                )}

                {diagnostics?.suggestedActions && diagnostics.suggestedActions.length > 0 && (
                  <div className="mt-4 space-y-2 pt-3 border-t border-[#F3F4F6]">
                    <span className="block text-xs font-semibold text-[#6B7280]">
                      Eksekusi Rekomendasi Aktuator:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {diagnostics.suggestedActions.map((act) => {
                        const alreadyTargeted =
                          actuators[act.actuatorId]?.isOn === act.targetState;
                        const edgeOnline = systemMeta.edgeOnline;
                        return (
                          <button
                            key={`${act.actuatorId}-${act.targetState}`}
                            type="button"
                            disabled={alreadyTargeted}
                            onClick={() => void setActuatorState(act.actuatorId, act.targetState)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                              alreadyTargeted
                                ? edgeOnline
                                  ? "bg-[#DCFCE7] text-[#166534] cursor-default"
                                  : "bg-[#F3F4F6] text-[#6B7280] cursor-default"
                                : edgeOnline
                                ? "bg-[#165B39] text-white hover:bg-[#124B2E] cursor-pointer"
                                : "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] cursor-pointer"
                            }`}
                            title={act.reason}
                          >
                            {alreadyTargeted ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {alreadyTargeted
                                ? `${act.label} (${edgeOnline ? "Aktif" : "Di Antrean"})`
                                : edgeOnline
                                ? act.label
                                : `${act.label} (Antrekan)`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs text-[#6B7280]">
                <span>Diperbarui: {formatIndonesianDate(activeCohort.updatedAt.split("T")[0])}</span>
                <button
                  type="button"
                  onClick={handleOpenSetup}
                  className="font-semibold text-[#165B39] hover:underline cursor-pointer"
                >
                  Sesuaikan Parameter &rarr;
                </button>
              </div>
            </div>
          )}
        </section>
      </RevealOnView>

      <PredictionSetupModal
        key={modalKey}
        isOpen={isSetupOpen}
        initialConfig={activeCohort}
        sensors={liveSensors}
        onClose={() => setIsSetupOpen(false)}
        onSave={handleSaveCohort}
      />
    </div>
  );
}
