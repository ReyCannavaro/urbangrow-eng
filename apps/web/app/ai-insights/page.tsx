"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, BrainCircuit, RefreshCw } from "lucide-react";
import { ClimateScoreCard } from "../../components/ai/ClimateScoreCard";
import { HarvestCountdownCard } from "../../components/ai/HarvestCountdownCard";
import {
  fetchClimateScore,
  fetchAnomalyInference,
  fetchAgriBotDiagnostics,
  ClimateScoreData,
  AnomalyPrediction,
} from "../../lib/aiApi";
import { EcosystemDiagnosticReport } from "../../lib/types";

export default function AiInsightsPage() {
  const [climateData, setClimateData] = useState<ClimateScoreData | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyPrediction | null>(null);
  const [diagnostics, setDiagnostics] = useState<EcosystemDiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);

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

  const pakcoy = diagnostics?.predictions.harvest.pakcoy;
  const kangkung = diagnostics?.predictions.harvest.kangkung;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <BrainCircuit className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Decision Support System
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            AI Predictive & Climate Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Prediksi pertumbuhan tanaman, kalkulasi akumulasi termal GDD, dan deteksi anomali multi-variat.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-lg transition hover:border-emerald-500/40 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          Perbarui Prediksi
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Climate Score */}
        {climateData && <ClimateScoreCard data={climateData} />}

        {/* Harvest Forecast: Pakcoy & Kangkung (Live Backend GDD) */}
        <div className="space-y-4">
          <HarvestCountdownCard
            cropName="pakcoy"
            daysToHarvest={pakcoy?.estimatedDaysRemaining ?? 10}
            accumulatedGdd={pakcoy?.accumulatedGdd ?? 185.0}
            targetGdd={pakcoy?.targetGdd ?? 380.0}
            projectedBiomassGrams={pakcoy?.projectedBiomassGrams ?? 65.0}
            growthStage={pakcoy?.growthStage ?? "Fase Pertumbuhan Vegetatif Cepat"}
          />
          <HarvestCountdownCard
            cropName="kangkung"
            daysToHarvest={kangkung?.estimatedDaysRemaining ?? 8}
            accumulatedGdd={kangkung?.accumulatedGdd ?? 195.0}
            targetGdd={kangkung?.targetGdd ?? 320.0}
            projectedBiomassGrams={kangkung?.projectedBiomassGrams ?? 72.0}
            growthStage={kangkung?.growthStage ?? "Fase Pematangan & Pembesaran Daun"}
          />
        </div>
      </div>

      {/* Anomaly Advisory Banner */}
      {anomaly && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Rekomendasi Tindakan Adaptif AI
          </div>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {anomaly.recommended_action}
          </p>
        </div>
      )}
    </div>
  );
}
