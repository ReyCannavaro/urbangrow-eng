"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Fish,
  Sprout,
  SlidersHorizontal,
  Calendar,
  Ruler,
  Hash,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  FishSpecies,
  PredictionCohortConfig,
  SensorData,
} from "../../lib/types";
import {
  computeLocalFishForecast,
  computeLocalSeedCropForecast,
  formatIndonesianDate,
  getDefaultPredictionCohort,
} from "../../lib/aiApi";

interface PredictionSetupModalProps {
  isOpen: boolean;
  initialConfig: PredictionCohortConfig;
  sensors: SensorData;
  onClose: () => void;
  onSave: (updated: PredictionCohortConfig) => Promise<void> | void;
}

export function PredictionSetupModal({
  isOpen,
  initialConfig,
  sensors,
  onClose,
  onSave,
}: PredictionSetupModalProps) {
  const [draft, setDraft] = useState<PredictionCohortConfig>(initialConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setFishMode = (mode: "both" | "nila" | "lele") => {
    setDraft((prev) => ({
      ...prev,
      fishMode: mode,
      nila: {
        ...prev.nila,
        enabled: mode === "both" || mode === "nila",
      },
      lele: {
        ...prev.lele,
        enabled: mode === "both" || mode === "lele",
      },
    }));
  };

  const updateFishField = <K extends keyof PredictionCohortConfig["nila"]>(
    species: FishSpecies,
    key: K,
    value: PredictionCohortConfig["nila"][K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      [species]: {
        ...prev[species],
        [key]: value,
      },
    }));
  };

  const updateCropField = <K extends keyof PredictionCohortConfig["pakcoy"]>(
    crop: "pakcoy" | "kangkung",
    key: K,
    value: PredictionCohortConfig["pakcoy"][K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      [crop]: {
        ...prev[crop],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...draft,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDraft(getDefaultPredictionCohort());
  };

  const showNila = draft.fishMode === "both" || draft.fishMode === "nila";
  const showLele = draft.fishMode === "both" || draft.fishMode === "lele";

  const nilaPreview = computeLocalFishForecast(draft.nila, sensors);
  const lelePreview = computeLocalFishForecast(draft.lele, sensors);
  const pakcoyPreview = computeLocalSeedCropForecast("pakcoy", draft.pakcoy, sensors);
  const kangkungPreview = computeLocalSeedCropForecast("kangkung", draft.kangkung, sensors);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-3 sm:p-5 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prediction-setup-title"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#165B39]/10 text-[#165B39]">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="prediction-setup-title"
                className="text-base font-bold tracking-tight text-[#111827] sm:text-lg"
              >
                Setup Data Prediksi Panen
              </h2>
              <p className="text-xs text-[#6B7280]">
                Konfigurasi tebar bibit ikan (Nila / Lele) & tanggal semai benih sayuran (Pakcoy & Kangkung).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal setup prediksi"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            {/* 1. FISH COHORT SETUP */}
            <section className="space-y-4">
              <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4 text-[#165B39]" />
                  <h3 className="text-sm font-bold text-[#111827]">
                    1. Data Tebar Bibit Ikan
                  </h3>
                </div>

                {/* Species Selector */}
                <div className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-1 text-xs">
                  {(
                    [
                      { id: "both", label: "Nila & Lele (L3 + L1)" },
                      { id: "nila", label: "Ikan Nila (L3)" },
                      { id: "lele", label: "Ikan Lele (L1)" },
                    ] as const
                  ).map((opt) => {
                    const active = draft.fishMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFishMode(opt.id)}
                        className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer ${
                          active
                            ? "bg-[#165B39] text-white"
                            : "text-[#6B7280] hover:text-[#111827]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`grid grid-cols-1 gap-4 ${
                  showNila && showLele ? "md:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Nila Card */}
                {showNila && (
                  <div className="space-y-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#111827]">
                          Ikan Nila (Oreochromis niloticus)
                        </span>
                        <p className="text-[11px] text-[#6B7280]">
                          Kolam Level 3 • Oksigen Terlarut Tinggi
                        </p>
                      </div>
                      <span className="rounded-full bg-[#165B39]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#165B39]">
                        Level 3
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Hash className="h-3 w-3 text-[#6B7280]" />
                          Jumlah Bibit (ekor)
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          required
                          value={draft.nila.count}
                          onChange={(e) =>
                            updateFishField(
                              "nila",
                              "count",
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Calendar className="h-3 w-3 text-[#6B7280]" />
                          Tanggal Tebar
                        </span>
                        <input
                          type="date"
                          required
                          value={draft.nila.stockingDate}
                          onChange={(e) =>
                            updateFishField("nila", "stockingDate", e.target.value)
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Ruler className="h-3 w-3 text-[#6B7280]" />
                          Panjang Bibit (cm)
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min={1}
                          max={40}
                          required
                          value={draft.nila.initialLengthCm}
                          onChange={(e) =>
                            updateFishField(
                              "nila",
                              "initialLengthCm",
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Ruler className="h-3 w-3 text-[#165B39]" />
                          Target Panen (cm)
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min={8}
                          max={60}
                          required
                          value={draft.nila.targetHarvestLengthCm}
                          onChange={(e) =>
                            updateFishField(
                              "nila",
                              "targetHarvestLengthCm",
                              Math.max(8, Number(e.target.value) || 22)
                            )
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>
                    </div>

                    {/* Quick size presets */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6B7280]">
                      <span>Preset ukuran panen:</span>
                      {[20, 22, 25].map((cm) => (
                        <button
                          key={cm}
                          type="button"
                          onClick={() =>
                            updateFishField("nila", "targetHarvestLengthCm", cm)
                          }
                          className={`rounded-full border px-2 py-0.5 transition-colors cursor-pointer ${
                            draft.nila.targetHarvestLengthCm === cm
                              ? "border-[#165B39] bg-[#165B39]/10 font-semibold text-[#165B39]"
                              : "border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]"
                          }`}
                        >
                          {cm} cm
                        </button>
                      ))}
                    </div>

                    {/* Live calculated preview */}
                    <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#374151]">
                      Estimasi siap panen:{" "}
                      <strong className="text-[#165B39]">
                        {formatIndonesianDate(nilaPreview.estimatedHarvestDate)}
                      </strong>{" "}
                      ({nilaPreview.estimatedDaysRemaining} hari lagi) • Proyeksi{" "}
                      <strong>~{nilaPreview.projectedTotalYieldKg} kg</strong>
                    </div>
                  </div>
                )}

                {/* Lele Card */}
                {showLele && (
                  <div className="space-y-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#111827]">
                          Ikan Lele (Clarias sp.)
                        </span>
                        <p className="text-[11px] text-[#6B7280]">
                          Kolam Level 1 • Dasar Sistem Biofilter
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                        Level 1
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Hash className="h-3 w-3 text-[#6B7280]" />
                          Jumlah Bibit (ekor)
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          required
                          value={draft.lele.count}
                          onChange={(e) =>
                            updateFishField(
                              "lele",
                              "count",
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Calendar className="h-3 w-3 text-[#6B7280]" />
                          Tanggal Tebar
                        </span>
                        <input
                          type="date"
                          required
                          value={draft.lele.stockingDate}
                          onChange={(e) =>
                            updateFishField("lele", "stockingDate", e.target.value)
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Ruler className="h-3 w-3 text-[#6B7280]" />
                          Panjang Bibit (cm)
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min={1}
                          max={40}
                          required
                          value={draft.lele.initialLengthCm}
                          onChange={(e) =>
                            updateFishField(
                              "lele",
                              "initialLengthCm",
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>

                      <label className="space-y-1 text-xs">
                        <span className="flex items-center gap-1 font-medium text-[#374151]">
                          <Ruler className="h-3 w-3 text-sky-700" />
                          Target Panen (cm)
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min={8}
                          max={60}
                          required
                          value={draft.lele.targetHarvestLengthCm}
                          onChange={(e) =>
                            updateFishField(
                              "lele",
                              "targetHarvestLengthCm",
                              Math.max(8, Number(e.target.value) || 26)
                            )
                          }
                          className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6B7280]">
                      <span>Preset ukuran panen:</span>
                      {[24, 26, 30].map((cm) => (
                        <button
                          key={cm}
                          type="button"
                          onClick={() =>
                            updateFishField("lele", "targetHarvestLengthCm", cm)
                          }
                          className={`rounded-full border px-2 py-0.5 transition-colors cursor-pointer ${
                            draft.lele.targetHarvestLengthCm === cm
                              ? "border-sky-600 bg-sky-50 font-semibold text-sky-700"
                              : "border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]"
                          }`}
                        >
                          {cm} cm
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#374151]">
                      Estimasi siap panen:{" "}
                      <strong className="text-sky-700">
                        {formatIndonesianDate(lelePreview.estimatedHarvestDate)}
                      </strong>{" "}
                      ({lelePreview.estimatedDaysRemaining} hari lagi) • Proyeksi{" "}
                      <strong>~{lelePreview.projectedTotalYieldKg} kg</strong>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. SEED-PLANTED CROPS SETUP */}
            <section className="space-y-4 border-t border-[#E5E7EB] pt-5">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-[#165B39]" />
                  <h3 className="text-sm font-bold text-[#111827]">
                    2. Data Semai Benih Tanaman (Pakcoy & Kangkung)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280]">
                  Perhitungan GDD penuh sejak tanam dari benih
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Pakcoy */}
                <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#111827]">
                        Sayuran Pakcoy
                      </span>
                      <p className="text-[11px] text-[#6B7280]">
                        Level 4 • Ditanam dari Benih (Target 440 °C·Hari)
                      </p>
                    </div>
                    <span className="rounded-full bg-[#165B39]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#165B39]">
                      Level 4
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1 text-xs">
                      <span className="flex items-center gap-1 font-medium text-[#374151]">
                        <Calendar className="h-3 w-3 text-[#6B7280]" />
                        Tanggal Semai Benih
                      </span>
                      <input
                        type="date"
                        required
                        value={draft.pakcoy.seedingDate}
                        onChange={(e) =>
                          updateCropField("pakcoy", "seedingDate", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                      />
                    </label>

                    <label className="space-y-1 text-xs">
                      <span className="flex items-center gap-1 font-medium text-[#374151]">
                        <Hash className="h-3 w-3 text-[#6B7280]" />
                        Jumlah Netpot
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        required
                        value={draft.pakcoy.plantCount}
                        onChange={(e) =>
                          updateCropField(
                            "pakcoy",
                            "plantCount",
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                        className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#374151]">
                    Usia <strong>{pakcoyPreview.daysSincePlanting} HSS</strong> • Estimasi panen:{" "}
                    <strong className="text-[#165B39]">
                      {formatIndonesianDate(pakcoyPreview.estimatedHarvestDate)}
                    </strong>{" "}
                    ({pakcoyPreview.estimatedDaysRemaining} hari lagi)
                  </div>
                </div>

                {/* Kangkung */}
                <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#111827]">
                        Sayuran Kangkung
                      </span>
                      <p className="text-[11px] text-[#6B7280]">
                        Level 2 • Ditanam dari Benih (Target 340 °C·Hari)
                      </p>
                    </div>
                    <span className="rounded-full bg-[#165B39]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#165B39]">
                      Level 2
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1 text-xs">
                      <span className="flex items-center gap-1 font-medium text-[#374151]">
                        <Calendar className="h-3 w-3 text-[#6B7280]" />
                        Tanggal Semai Benih
                      </span>
                      <input
                        type="date"
                        required
                        value={draft.kangkung.seedingDate}
                        onChange={(e) =>
                          updateCropField("kangkung", "seedingDate", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                      />
                    </label>

                    <label className="space-y-1 text-xs">
                      <span className="flex items-center gap-1 font-medium text-[#374151]">
                        <Hash className="h-3 w-3 text-[#6B7280]" />
                        Jumlah Netpot
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        required
                        value={draft.kangkung.plantCount}
                        onChange={(e) =>
                          updateCropField(
                            "kangkung",
                            "plantCount",
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                        className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#165B39] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#374151]">
                    Usia <strong>{kangkungPreview.daysSincePlanting} HSS</strong> • Estimasi panen:{" "}
                    <strong className="text-[#165B39]">
                      {formatIndonesianDate(kangkungPreview.estimatedHarvestDate)}
                    </strong>{" "}
                    ({kangkungPreview.estimatedDaysRemaining} hari lagi)
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-white hover:text-[#111827] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Default
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#165B39] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#124B2E] disabled:opacity-60 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                {saving ? "Menyimpan..." : "Simpan & Hitung Prediksi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

