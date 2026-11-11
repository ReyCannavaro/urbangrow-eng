"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Fish,
  Sprout,
  CalendarCheck2,
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
  ph: 6.95,
  tds: 540,
  waterTemperature: 25.4,
  airTemperature: 27.6,
  humidity: 66.0,
  lightIntensity: 1350,
  dissolvedOxygen: 6.8,
  waterLevel: 92.0,
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
  const { actuators, setActuatorState } = useTelemetry();
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

  const totalFishCount =
    (showNila ? activeCohort.nila.count : 0) +
    (showLele ? activeCohort.lele.count : 0);

  const cleanRecommendedAction = anomaly?.recommended_action
    ? anomaly.recommended_action.toLowerCase().includes("ai engine offline")
      ? "Mode heuristik ECAD aktif: pemantauan otomatis pH, suhu air DS18B20, TDS, iklim DHT22, dan intensitas cahaya LDR berada dalam kondisi terpantau."
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
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
            Prediksi Panen &amp; Inteligensi AI
          </h1>
          <p className="mt-1 text-xs text-[#6B7280]">
            Proyeksi siap panen budidaya ikan (Nila / Lele), semai benih sayuran (Pakcoy &amp; Kangkung), dan skor adaptasi iklim.
          </p>
        </div>

        {/* Action Buttons */}
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

      {/* ===================================================================
          1. INTEGRATED AGRO-INTELLIGENCE HORIZON (Replaces Generic 3-Box Strip)
          =================================================================== */}
      <section
        style={{ "--ug-delay": "65ms" } as React.CSSProperties}
        className="ug-enter rounded-[24px] bg-[#165B39] text-white p-5 sm:p-6 shadow-sm border border-[#145233]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#68C194] animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68C194]">
                ECAD PREDICTIVE ENGINE &bull; ACTIVE HARVEST HORIZON
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Horizon Panen &amp; Akumulasi Pertumbuhan Hayati</span>
            </h2>
            <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
              Model matematis GDD (*Growing Degree Days*) memproyeksikan laju kematangan tanaman dari tanggal semai benih, disinkronkan dengan estimasi bobot rata-rata harian (ADG) bibit ikan.
            </p>
          </div>

          {/* Integrated Biological Horizon Metrics (Typography-First) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono text-xs">
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <div className="text-[9.5px] uppercase tracking-wider text-white/60">Batch Ikan</div>
              <div className="font-bold text-white text-sm num-tabular mt-0.5">
                {totalFishCount} Ekor <span className="text-[10px] text-white/60 font-normal">({activeCohort.fishMode === "both" ? "Nila & Lele" : activeCohort.fishMode === "nila" ? "Nila" : "Lele"})</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <div className="text-[9.5px] uppercase tracking-wider text-white/60">Pakcoy (L4)</div>
              <div className="font-bold text-[#68C194] text-sm num-tabular mt-0.5">
                {pakcoy.estimatedDaysRemaining} Hari <span className="text-[10px] text-white/60 font-normal">({formatIndonesianDate(pakcoy.estimatedHarvestDate)})</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <div className="text-[9.5px] uppercase tracking-wider text-white/60">Kangkung (L2)</div>
              <div className="font-bold text-[#FDE68A] text-sm num-tabular mt-0.5">
                {kangkung.estimatedDaysRemaining} Hari <span className="text-[10px] text-white/60 font-normal">({formatIndonesianDate(kangkung.estimatedHarvestDate)})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Prediksi Panen Ikan (Nila / Lele) */}
      <section
        style={{ "--ug-delay": "130ms" } as React.CSSProperties}
        className="ug-enter space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#111827]">
            Proyeksi Pertumbuhan &amp; Panen Budidaya Ikan
          </h2>
          <span className="text-xs text-[#6B7280]">
            Dihitung dari panjang tebar awal, tanggal tebar &amp; telemetri pH/suhu air
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

      {/* Section 2: Prediksi Panen Sayuran (Tanam dari Benih) */}
      <RevealOnView delayMs={0}>
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#111827]">
              Proyeksi Panen Sayuran Vertikal (Tanam dari Benih)
            </h2>
            <span className="text-xs text-[#6B7280]">
              Model GDD penuh sejak tanggal semai benih
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
            <div className="flex flex-col justify-between rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-6 transition-colors hover:bg-[#F9FAFB]/40 hover:border-[#D1D5DB]">
              <div>
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3.5">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#165B39] block">
                      AI Diagnostic Synthesis
                    </span>
                    <h3 className="text-base font-bold text-[#111827] mt-0.5">
                      Rekomendasi Tindakan Adaptif AI
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#165B39]/20 bg-[#DCFCE7] px-2.5 py-0.5 font-mono text-xs font-bold text-[#166534]">
                    {anomaly.risk_level}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#374151]">
                  {cleanRecommendedAction}
                </p>

                {cleanWaterForecast && (
                  <div className="mt-4 rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3.5 text-xs leading-relaxed text-[#4B5563]">
                    <span className="mb-1 block font-semibold text-[#111827]">
                      Proyeksi Stabilitas Biofilter 24 Jam:
                    </span>
                    {cleanWaterForecast}
                  </div>
                )}

                {diagnostics?.suggestedActions && diagnostics.suggestedActions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="block text-[11px] font-semibold text-[#6B7280]">
                      Eksekusi Cepat Rekomendasi AI:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {diagnostics.suggestedActions.map((act) => {
                        const alreadyActive =
                          actuators[act.actuatorId]?.isOn === act.targetState;
                        return (
                          <button
                            key={`${act.actuatorId}-${act.targetState}`}
                            type="button"
                            disabled={alreadyActive}
                            onClick={() => void setActuatorState(act.actuatorId, act.targetState)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              alreadyActive
                                ? "border border-[#165B39]/25 bg-[#DCFCE7] text-[#166534] cursor-default"
                                : "bg-[#165B39] text-white hover:bg-[#124B2E]"
                            }`}
                            title={act.reason}
                          >
                            {alreadyActive ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {alreadyActive ? `${act.label} (Aktif)` : act.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3 text-xs text-[#6B7280]">
                <span>Terakhir diperbarui: {formatIndonesianDate(activeCohort.updatedAt.split("T")[0])}</span>
                <button
                  type="button"
                  onClick={handleOpenSetup}
                  className="font-semibold text-[#165B39] hover:underline cursor-pointer"
                >
                  Sesuaikan Parameter Batch →
                </button>
              </div>
            </div>
          )}
        </section>
      </RevealOnView>

      {/* Setup Data Prediksi Popup Modal */}
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
