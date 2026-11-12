"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  LayoutDashboard,
  Layers,
  SlidersHorizontal,
  Sparkles,
  Bot,
  Bell,
  Power,
  Send,
  Download,
  Droplets,
  Sun,
  Thermometer,
  Gauge,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { useTelemetry } from "@/lib/telemetryContext";
import { downloadTelemetryCsv } from "@/lib/operationsApi";

interface CommandItem {
  id: string;
  section: "Sensor Real-Time" | "Aksi Cepat Aktuator" | "Navigasi & Laporan";
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
  onSelect: () => Promise<void> | void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const { sensors, actuators, systemMeta, history, toggleActuator, dispenseFeed } = useTelemetry();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const edgeOnline = systemMeta.edgeOnline;
    const go = (path: string) => {
      onClose();
      router.push(path);
    };

    const runActuator = async (id: string, label: string) => {
      const res = await toggleActuator(id);
      if (res.ok) {
        setActionFeedback(
          edgeOnline
            ? `${label} berhasil diperbarui.`
            : `${label} masuk antrean target server (ESP32 offline).`
        );
      } else {
        setActionFeedback(res.error || `Gagal mengubah ${label}.`);
      }
    };

    const phText =
      typeof sensors.ph === "number" ? sensors.ph.toFixed(2) : "--";
    const phBadge =
      typeof sensors.ph !== "number"
        ? "Offline"
        : sensors.ph >= 6.5 && sensors.ph <= 7.5
          ? "Optimal"
          : "Perhatian";
    const tdsText =
      typeof sensors.tds === "number" ? `${Math.round(sensors.tds)} ppm` : "--";
    const waterTempText =
      typeof sensors.waterTemperature === "number"
        ? `${sensors.waterTemperature.toFixed(1)} °C`
        : "--";
    const waterTempBadge =
      typeof sensors.waterTemperature === "number"
        ? `${sensors.waterTemperature.toFixed(1)}°C`
        : "Offline";
    const airTempText =
      typeof sensors.airTemperature === "number"
        ? `${sensors.airTemperature.toFixed(1)}°C`
        : "--°C";
    const humidityText =
      typeof sensors.humidity === "number"
        ? `${sensors.humidity.toFixed(0)}%`
        : "--%";
    const luxText =
      typeof sensors.lightIntensity === "number"
        ? `${Math.round(sensors.lightIntensity)} lux`
        : "--";

    return [
      // Live Sensors
      {
        id: "sensor-ph",
        section: "Sensor Real-Time",
        title: `Sensor pH Air Kolam: ${phText}`,
        subtitle: "Target ideal ECAD: 6.5 – 7.5 pH • Klik untuk buka grafik deret waktu",
        badge: phBadge,
        icon: Droplets,
        keywords: "ph asam basa air sensor",
        onSelect: () => go("/analytics"),
      },
      {
        id: "sensor-tds",
        section: "Sensor Real-Time",
        title: `Nutrisi TDS Terlarut: ${tdsText}`,
        subtitle: "Target vegetatif Pakcoy & Kangkung: 400 – 800 ppm",
        badge: typeof sensors.tds === "number" ? tdsText : "Offline",
        icon: Gauge,
        keywords: "tds nutrisi ppm pupuk",
        onSelect: () => go("/analytics"),
      },
      {
        id: "sensor-temp",
        section: "Sensor Real-Time",
        title: `Suhu Air Kolam: ${waterTempText}`,
        subtitle: `Suhu udara ${airTempText} • Kelembaban ${humidityText}`,
        badge: waterTempBadge,
        icon: Thermometer,
        keywords: "suhu temperatur air udara ds18b20 dht22",
        onSelect: () => go("/analytics"),
      },
      {
        id: "sensor-lux",
        section: "Sensor Real-Time",
        title: `Intensitas Cahaya LDR: ${luxText}`,
        subtitle: "Sensor cahaya rak vertikal Pakcoy & Kangkung",
        badge: typeof sensors.lightIntensity === "number" ? luxText : "Offline",
        icon: Sun,
        keywords: "cahaya lux ldr lampu grow light",
        onSelect: () => go("/analytics"),
      },

      // Quick Actuator Actions
      {
        id: "act-feed",
        section: "Aksi Cepat Aktuator",
        title: "Beri Pakan Ikan Sekarang (35g Pelet)",
        subtitle: edgeOnline
          ? "Menjalankan pulse auto-feeder 3000ms untuk kolam Nila & Lele"
          : "ESP32 offline — simpan pulse pakan 35g ke antrean perintah server",
        badge: edgeOnline ? "Pulse 3s" : "Antrean",
        icon: Send,
        keywords: "pakan feeder beri makan ikan nila lele",
        onSelect: async () => {
          await dispenseFeed();
          setActionFeedback(
            edgeOnline
              ? "35g pakan berhasil didistribusikan."
              : "Antrean pulse pakan 35g disimpan di server (ESP32 offline)."
          );
        },
      },
      {
        id: "act-aerator",
        section: "Aksi Cepat Aktuator",
        title: `${actuators.aerator?.isOn ? "Matikan" : "Nyalakan"} Aerator Oksigen (RELAY-02)`,
        subtitle: "Sirkulasi aerasi udara untuk kolam Ikan Nila Level 3",
        badge: !edgeOnline
          ? `Antrean: ${actuators.aerator?.isOn ? "ON" : "OFF"}`
          : actuators.aerator?.isOn
          ? "ON"
          : "OFF",
        icon: Power,
        keywords: "aerator oksigen relay 02 nyalakan matikan",
        onSelect: () => runActuator("aerator", "Aerator Oksigen"),
      },
      {
        id: "act-growlight",
        section: "Aksi Cepat Aktuator",
        title: `${actuators.growLight?.isOn ? "Matikan" : "Nyalakan"} LED Grow Light (RELAY-03)`,
        subtitle: "Pencahayaan fotosintesis vertikal Pakcoy L4 & Kangkung L2",
        badge: !edgeOnline
          ? `Antrean: ${actuators.growLight?.isOn ? "ON" : "OFF"}`
          : actuators.growLight?.isOn
          ? "ON"
          : "OFF",
        icon: Power,
        keywords: "lampu grow light led relay 03 nyalakan matikan",
        onSelect: () => runActuator("growLight", "LED Grow Light"),
      },
      {
        id: "act-pump",
        section: "Aksi Cepat Aktuator",
        title: `${actuators.waterPump?.isOn ? "Matikan" : "Nyalakan"} Pompa Sirkulasi 12V (RELAY-01)`,
        subtitle: "Resirkulasi tertutup biofilter 4-level (RELAY-01)",
        badge: !edgeOnline
          ? `Antrean: ${actuators.waterPump?.isOn ? "ON" : "OFF"}`
          : actuators.waterPump?.isOn
          ? "ON"
          : "OFF",
        icon: Power,
        keywords: "pompa air sirkulasi relay 01 nyalakan matikan",
        onSelect: () => runActuator("waterPump", "Pompa Sirkulasi"),
      },

      // Navigation & Reports
      {
        id: "nav-dashboard",
        section: "Navigasi & Laporan",
        title: "Buka Dashboard Utama",
        subtitle: "Ringkasan metrik real-time, jadwal otomasi, dan status relay",
        icon: LayoutDashboard,
        keywords: "dashboard beranda home utama",
        onSelect: () => go("/"),
      },
      {
        id: "nav-ai-insights",
        section: "Navigasi & Laporan",
        title: "Prediksi Panen & Setup Batch Bibit / Benih",
        subtitle: "Atur jumlah bibit ikan Nila/Lele & tanggal semai benih Pakcoy/Kangkung",
        icon: Sparkles,
        keywords: "prediksi ai panen ikan nila lele pakcoy kangkung bibit benih",
        onSelect: () => go("/ai-insights"),
      },
      {
        id: "nav-agribot",
        section: "Navigasi & Laporan",
        title: "Tanya AgriBot AI (Analisis Foto & Grafik)",
        subtitle: "Konsultasi gejala penyakit daun/ikan dan buat grafik IoT dinamis",
        icon: Bot,
        keywords: "agribot chat ai diagnosis foto penyakit grafik",
        onSelect: () => go("/agribot"),
      },
      {
        id: "nav-ecosystem",
        section: "Navigasi & Laporan",
        title: "Visualisasi Menara Kaskade 4-Level",
        subtitle: "Aliran air biofilter dari Level 4 hingga Kolam Level 1",
        icon: Layers,
        keywords: "menara kaskade ekosistem 4 level biofilter",
        onSelect: () => go("/ecosystem"),
      },
      {
        id: "nav-controls",
        section: "Navigasi & Laporan",
        title: "Kontrol Relay & Interlock Keamanan",
        subtitle: "Panel kendali manual & mode otomatis seluruh perangkat keras",
        icon: SlidersHorizontal,
        keywords: "kontrol relay aktuator hardware esp32",
        onSelect: () => go("/controls"),
      },
      {
        id: "nav-alerts",
        section: "Navigasi & Laporan",
        title: "Log Notifikasi & Riwayat Aktuator",
        subtitle: "Catatan peringatan sistem & audit perubahan relay tersimpan di database",
        icon: Bell,
        keywords: "notifikasi log alert riwayat audit",
        onSelect: () => go("/alerts"),
      },
      {
        id: "action-export-csv",
        section: "Navigasi & Laporan",
        title: "Unduh Laporan Data Telemetri (CSV)",
        subtitle: "Export rekaman sensor dari database SQLite untuk analisis penelitian",
        icon: Download,
        keywords: "export csv download unduh laporan data",
        onSelect: async () => {
          await downloadTelemetryCsv(history);
          setActionFeedback("File CSV telemetri berhasil diunduh.");
        },
      },
    ];
  }, [sensors, actuators, systemMeta.edgeOnline, history, toggleActuator, dispenseFeed, onClose, router]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.includes(q) ||
        item.section.toLowerCase().includes(q)
    );
  }, [items, query]);

  const activeIdx =
    filteredItems.length === 0 ? 0 : Math.min(selectedIndex, filteredItems.length - 1);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0
            ? 0
            : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      } else if (e.key === "Enter" && filteredItems[activeIdx]) {
        e.preventDefault();
        void filteredItems[activeIdx].onSelect();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, activeIdx, onClose]);

  if (!isOpen) return null;

  const sections: Array<CommandItem["section"]> = [
    "Sensor Real-Time",
    "Aksi Cepat Aktuator",
    "Navigasi & Laporan",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#111827]/40 px-3 pt-14 sm:pt-20 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian cepat UrbanGrow"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3.5 sm:px-5">
          <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ketik nama sensor (pH, TDS, suhu), aktuator, atau halaman..."
            className="w-full bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian cepat"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Optional Execution Feedback Strip */}
        {actionFeedback && (
          <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F0FDF4] px-5 py-2 text-xs font-medium text-[#165B39]">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {actionFeedback}
            </span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-[11px] underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[62vh] overflow-y-auto p-2.5 sm:p-3">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#6B7280]">
              Tidak ada hasil yang cocok dengan kata kunci &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((sectionName) => {
                const group = filteredItems.filter((it) => it.section === sectionName);
                if (group.length === 0) return null;
                return (
                  <div key={sectionName} className="space-y-1">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-[#6B7280]">
                      {sectionName}
                    </div>
                    {group.map((item) => {
                      const flatIndex = filteredItems.findIndex((f) => f.id === item.id);
                      const isSelected = flatIndex === activeIdx;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={() => void item.onSelect()}
                          className={`group flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#F3F4F6] text-[#111827]"
                              : "bg-white text-[#111827] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                                isSelected
                                  ? "border-[#165B39]/25 bg-[#165B39]/10 text-[#165B39]"
                                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold text-[#111827]">
                                {item.title}
                              </div>
                              <div className="truncate text-[11px] text-[#6B7280]">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {item.badge && (
                              <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#374151]">
                                {item.badge}
                              </span>
                            )}
                            <ArrowUpRight className="h-3.5 w-3.5 text-[#9CA3AF] transition-transform duration-200 group-hover:rotate-45 group-hover:text-[#165B39]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Shortcut Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-2.5 text-[11px] text-[#6B7280]">
          <span>Gunakan tombol panah ↑ ↓ dan Enter untuk memilih</span>
          <span className="font-mono">ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
}

