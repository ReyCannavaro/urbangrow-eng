"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Sparkles,
  Trash2,
  Sun,
  Power,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  SensorData,
  EcosystemDiagnosticReport,
  SuggestedAction,
  AgriBotChatTurn,
} from "@/lib/types";
import { sendAgriBotChat } from "@/lib/aiApi";
import { useTelemetry } from "@/lib/telemetryContext";

let chatMessageSeq = 1;
function nextChatId(prefix: string): string {
  chatMessageSeq += 1;
  return `${prefix}-${chatMessageSeq}`;
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  provider?: string;
  model?: string;
  category?: string;
  latencyMs?: number;
  suggestedActions?: SuggestedAction[];
}

interface ChatWindowProps {
  sensors: SensorData;
  cropDayPakcoy?: number;
  cropDayKangkung?: number;
  onDiagnosticsUpdate?: (
    diagnostics: EcosystemDiagnosticReport,
    meta: { provider: string; model: string; latencyMs: number }
  ) => void;
}

const QUICK_PROMPTS = [
  {
    label: "Diagnosis 3 Domain",
    prompt:
      "Berikan diagnosis lengkap kondisi tumbuhan Pakcoy dan Kangkung, kualitas air, serta kesehatan ikan Nila dan Lele berdasarkan data sensor saat ini.",
  },
  {
    label: "Prediksi & Gejala Air",
    prompt:
      "Bagaimana prediksi kondisi air dan gejala dini apa saja yang berpotensi muncul dari tren pembacaan sensor saat ini?",
  },
  {
    label: "Estimasi Panen GDD",
    prompt:
      "Kapan estimasi panen Pakcoy L4 dan Kangkung L2 berdasarkan suhu air serta pembacaan cahaya sensor LDR sekarang?",
  },
  {
    label: "Daun Menguning / Klorosis",
    prompt:
      "Jika daun tanaman mulai menguning atau pertumbuhan melambat, apa analisisnya berdasarkan pH, TDS, dan sensor cahaya LDR saat ini?",
  },
  {
    label: "Ikan Megap-megap / DO",
    prompt:
      "Apakah kondisi oksigen terlarut (DO) dan suhu air aman untuk Ikan Nila dan Lele? Gejala awal apa yang harus diwaspadai?",
  },
  {
    label: "Optimasi Nutrisi & Cahaya",
    prompt:
      "Bagaimana rekomendasi optimasi pH, TDS nutrisi, dan intensitas cahaya LDR untuk pertumbuhan Pakcoy L4 & Kangkung L2 saat ini?",
  },
];

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[11px] font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function FormattedMarkdownMessage({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);

  return (
    <div className="space-y-1.5">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-[13px] font-bold text-[#165B39] pt-1 tracking-tight"
            >
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h4
              key={idx}
              className="text-[13.5px] font-bold text-[#111827] pt-1 tracking-tight"
            >
              {renderInlineMarkdown(line.slice(3))}
            </h4>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#165B39] mt-1.5 shrink-0" />
              <div className="flex-1 leading-relaxed">
                {renderInlineMarkdown(line.slice(2))}
              </div>
            </div>
          );
        }

        const numberedMatch = line.match(/^(\d+\.)\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-mono font-bold text-[#165B39] shrink-0">
                {numberedMatch[1]}
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineMarkdown(numberedMatch[2])}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export function ChatWindow({
  sensors,
  cropDayPakcoy = 14,
  cropDayKangkung = 17,
  onDiagnosticsUpdate,
}: ChatWindowProps) {
  const { actuators, setActuatorState, systemMeta } = useTelemetry();

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Halo! Saya **AgriBot Gemini**, asisten pakar akuaponik cerdas UrbanGrow.\n\nSaya memantau telemetri sensor node ESP32 Anda secara real-time (**cahaya LDR, pH air, suhu, TDS, oksigen terlarut DO, dan level tandon**) untuk:\n- **Diagnosis 3 Domain**: Kondisi tumbuhan Pakcoy & Kangkung, kualitas air, dan kesehatan Ikan Nila & Lele.\n- **Prediksi Proaktif**: Tren air ke depan, gejala awal anomali sebelum ikan/tanaman stres, dan estimasi hari panen GDD.\n\nSilakan ketik pertanyaan atau klik topik cepat di bawah.",
      time: "Sekarang",
      provider: "gemini",
      model: "gemini-3.5-flash-lite",
      category: "general",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend ?? input).trim();
    if (!q || isTyping) return;

    const userMsg: ChatMsg = {
      id: nextChatId("u"),
      sender: "user",
      text: q,
      time: formatNowTime(),
    };

    const historyPayload: AgriBotChatTurn[] = messages
      .filter((m) => m.id !== "welcome-1")
      .slice(-6)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    const res = await sendAgriBotChat({
      message: q,
      history: historyPayload,
      cropDayPakcoy,
      cropDayKangkung,
    });
    const latencyMs = res.latencyMs ?? 0;

    if (res.diagnostics && onDiagnosticsUpdate) {
      onDiagnosticsUpdate(res.diagnostics, {
        provider: res.provider,
        model: res.model,
        latencyMs,
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        id: nextChatId("b"),
        sender: "bot",
        text: res.reply,
        time: formatNowTime(),
        provider: res.provider,
        model: res.model,
        category: res.category,
        latencyMs,
        suggestedActions: res.suggestedActions,
      },
    ]);
    setIsTyping(false);
  };

  const handleExecuteSuggestedAction = async (
    messageId: string,
    action: SuggestedAction
  ) => {
    const key = `${messageId}:${action.actuatorId}`;
    setPendingActionKey(key);
    const result = await setActuatorState(action.actuatorId, action.targetState);
    setPendingActionKey(null);

    if (result.ok) {
      setActionFeedback((prev) => ({
        ...prev,
        [key]: { ok: true, msg: "Diterapkan ke Relay!" },
      }));
    } else {
      setActionFeedback((prev) => ({
        ...prev,
        [key]: { ok: false, msg: result.error || "Ditolak safety lock" },
      }));
    }
  };

  const handleResetChat = () => {
    setActionFeedback({});
    setMessages([
      {
        id: "welcome-1",
        sender: "bot",
        text: "Percakapan telah direset. Siap membantu diagnosis tumbuhan, air, ikan, serta prediksi panen dan gejala dini akuaponik Anda.",
        time: "Sekarang",
        provider: "gemini",
        model: "gemini-3.5-flash-lite",
        category: "general",
      },
    ]);
  };

  const formatCategory = (cat?: string) => {
    switch (cat) {
      case "diagnosis":
        return "Diagnosis";
      case "prediction":
        return "Prediksi";
      case "advisory":
        return "Saran Tindakan";
      default:
        return "Asisten";
    }
  };

  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col h-[640px]">
      {/* 1. Chat Window Header Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-[#165B39] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-[#111827]">
                AgriBot Telemetry Copilot
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#DCFCE7] text-[#166534]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#166534] animate-pulse" />
                {systemMeta.edgeOnline ? "ESP32 Online • Live" : "Telemetri Real-Time"}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
              Terhubung ke Gemini API dengan injeksi telemetri ESP32 real-time
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Reset Percakapan"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 1b. Live ESP32 Sensor Context Strip */}
      <div className="py-2 px-3 mt-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex flex-wrap items-center gap-2 text-[10.5px] font-mono">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#166534] border border-[#165B39]/25">
          <Sun className="h-3 w-3 text-[#D97706]" />
          <span>
            LDR {Math.round(sensors.lightIntensity)} lux (LIVE ESP32)
          </span>
        </span>
        <span className="text-[#4B5563]">
          pH <strong className="text-[#111827]">{sensors.ph.toFixed(2)}</strong>
        </span>
        <span className="text-[#D1D5DB]">•</span>
        <span className="text-[#4B5563]">
          Suhu <strong className="text-[#111827]">{sensors.waterTemperature.toFixed(1)}°C</strong>
        </span>
        <span className="text-[#D1D5DB]">•</span>
        <span className="text-[#4B5563]">
          TDS <strong className="text-[#111827]">{Math.round(sensors.tds)} ppm</strong>
        </span>
        <span className="text-[#D1D5DB]">•</span>
        <span className="text-[#4B5563]">
          DO <strong className="text-[#111827]">{sensors.dissolvedOxygen.toFixed(2)} mg/L</strong>
        </span>
      </div>

      {/* 2. Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender === "bot" && (
              <div className="h-8 w-8 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[78%] p-4 rounded-[20px] text-xs shadow-xs ${
                m.sender === "user"
                  ? "bg-[#165B39] text-white rounded-tr-none font-medium"
                  : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827] rounded-tl-none"
              }`}
            >
              {m.sender === "bot" && (m.provider || m.category) && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[#E5E7EB]/80 text-[10px] font-mono">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      m.provider === "gemini"
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {m.provider === "gemini" ? "✨ Gemini" : "⚙️ ECAD Engine"}
                    {m.model ? ` • ${m.model}` : ""}
                  </span>
                  {m.category && (
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#4B5563]">
                      {formatCategory(m.category)}
                    </span>
                  )}
                  {m.latencyMs !== undefined && (
                    <span className="text-[#9CA3AF] ml-auto">{m.latencyMs}ms</span>
                  )}
                </div>
              )}

              <FormattedMarkdownMessage text={m.text} />

              {/* One-Click Interactive Suggested Actuator Actions */}
              {m.sender === "bot" && m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">
                    Tindakan Relay Disarankan
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.suggestedActions.map((act) => {
                      const key = `${m.id}:${act.actuatorId}`;
                      const liveActuator = actuators[act.actuatorId];
                      const alreadyMatches =
                        liveActuator && liveActuator.isOn === act.targetState;
                      const isPending = pendingActionKey === key;
                      const feedback = actionFeedback[key];

                      return (
                        <div key={key} className="space-y-1">
                          <button
                            type="button"
                            disabled={alreadyMatches || isPending}
                            onClick={() => handleExecuteSuggestedAction(m.id, act)}
                            title={act.reason}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                              alreadyMatches
                                ? "bg-[#DCFCE7] text-[#166534] border border-[#165B39]/25 cursor-default"
                                : "bg-[#165B39] hover:bg-[#124B2E] text-white shadow-2xs"
                            }`}
                          >
                            {isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : alreadyMatches ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                            <span>
                              {alreadyMatches ? `${act.label} (Aktif)` : act.label}
                            </span>
                          </button>
                          {feedback && !feedback.ok && (
                            <div className="flex items-center gap-1 text-[10px] text-rose-600">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span>{feedback.msg}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <span
                className={`text-[10px] block mt-2 text-right font-mono ${
                  m.sender === "user" ? "text-white/70" : "text-[#9CA3AF]"
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="px-4 py-3 rounded-[18px] rounded-tl-none bg-[#F8F9FA] border border-[#E5E7EB] flex items-center gap-2 text-xs text-[#4B5563]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#165B39] animate-bounce" />
                <span
                  className="h-2 w-2 rounded-full bg-[#165B39] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-[#165B39] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              <span className="font-mono text-[11px] text-[#6B7280]">
                Menganalisis sensor &amp; memanggil Gemini AI...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompts Chips */}
      <div className="pt-2.5 pb-2 border-t border-[#F3F4F6] flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            type="button"
            disabled={isTyping}
            onClick={() => handleSend(qp.prompt)}
            className="px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] hover:bg-[#DCFCE7] hover:text-[#166534] hover:border-[#166534]/30 disabled:opacity-50 text-[#4B5563] text-[11px] font-medium transition cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* 4. Input Bar */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={input}
          disabled={isTyping}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tanya AgriBot: diagnosis tanaman/air/ikan, prediksi panen, atau gejala dini..."
          className="flex-1 px-4 py-2.5 rounded-full border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#165B39] focus:ring-1 focus:ring-[#165B39] bg-[#F8F9FA] placeholder:text-[#9CA3AF] disabled:opacity-60"
        />
        <button
          type="button"
          disabled={isTyping || !input.trim()}
          onClick={() => handleSend()}
          className="h-10 w-10 rounded-full bg-[#165B39] hover:bg-[#0F3F27] disabled:opacity-50 text-white flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
          aria-label="Kirim pesan"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
