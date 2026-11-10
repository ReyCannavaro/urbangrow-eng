"use client";

import React, { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Send,
  Sparkles,
  RotateCcw,
  ImagePlus,
  X,
  Power,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  BarChart3,
  Camera,
  TrendingUp,
  Radar,
  UploadCloud,
} from "lucide-react";
import {
  SuggestedAction,
  AgriBotChatTurn,
  AgriBotChartSpec,
  AgriBotImageAttachment,
} from "@/lib/types";
import { sendAgriBotChat } from "@/lib/aiApi";
import { useTelemetry } from "@/lib/telemetryContext";
import { DynamicChartRenderer } from "./DynamicChartRenderer";

let chatMessageSeq = 1;
function nextChatId(prefix: string): string {
  chatMessageSeq += 1;
  return `${prefix}-${chatMessageSeq}`;
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MAX_IMAGES_PER_TURN = 3;
const AGRIBOT_SESSION_KEY = "urbangrow_agribot_session_v1";
const EMPTY_CHAT_MESSAGES: ChatMsg[] = [];

let cachedSessionRaw: string | null = null;
let cachedSessionMessages: ChatMsg[] = EMPTY_CHAT_MESSAGES;
const sessionListeners = new Set<() => void>();

function emitSessionChange() {
  for (const listener of sessionListeners) {
    listener();
  }
}

function subscribeAgriBotSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === AGRIBOT_SESSION_KEY) {
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    sessionListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getAgriBotSessionSnapshot(): ChatMsg[] {
  if (typeof window === "undefined") return EMPTY_CHAT_MESSAGES;
  try {
    const raw = window.sessionStorage.getItem(AGRIBOT_SESSION_KEY);
    if (!raw) {
      cachedSessionRaw = null;
      cachedSessionMessages = EMPTY_CHAT_MESSAGES;
      return EMPTY_CHAT_MESSAGES;
    }
    if (raw === cachedSessionRaw) {
      return cachedSessionMessages;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedSessionRaw = raw;
      cachedSessionMessages = parsed as ChatMsg[];
      return cachedSessionMessages;
    }
  } catch {
    // Ignore storage parse or security errors
  }
  return EMPTY_CHAT_MESSAGES;
}

function getAgriBotServerSnapshot(): ChatMsg[] {
  return EMPTY_CHAT_MESSAGES;
}

function writeAgriBotSessionMessages(nextMessages: ChatMsg[]) {
  if (typeof window === "undefined") return;
  try {
    if (nextMessages.length === 0) {
      window.sessionStorage.removeItem(AGRIBOT_SESSION_KEY);
      cachedSessionRaw = null;
      cachedSessionMessages = EMPTY_CHAT_MESSAGES;
      emitSessionChange();
      return;
    }
    const recent = nextMessages.slice(-24);
    let serialized = JSON.stringify(recent);
    if (serialized.length > 1_500_000) {
      const lightweight = recent.map((m) => ({
        ...m,
        images: m.images?.map((img) => ({
          mimeType: img.mimeType,
          data: "",
          name: img.name,
          previewUrl: img.previewUrl,
        })),
      }));
      serialized = JSON.stringify(lightweight);
    }
    window.sessionStorage.setItem(AGRIBOT_SESSION_KEY, serialized);
    cachedSessionRaw = serialized;
    cachedSessionMessages = recent;
    emitSessionChange();
  } catch {
    try {
      const textOnly = nextMessages.slice(-24).map((m) => ({
        ...m,
        images: undefined,
      }));
      const serialized = JSON.stringify(textOnly);
      window.sessionStorage.setItem(AGRIBOT_SESSION_KEY, serialized);
      cachedSessionRaw = serialized;
      cachedSessionMessages = textOnly;
      emitSessionChange();
    } catch {
      // Storage unavailable
    }
  }
}

async function compressImageFile(file: File): Promise<AgriBotImageAttachment> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`File "${file.name}" bukan gambar yang didukung.`);
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error(`Ukuran "${file.name}" terlalu besar (maks. 12 MB).`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Format gambar tidak dapat diproses."));
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas browser tidak tersedia untuk memproses gambar."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outMime =
          file.type === "image/png" && file.size <= 450_000
            ? "image/png"
            : "image/jpeg";
        const dataUrl = canvas.toDataURL(
          outMime,
          outMime === "image/jpeg" ? 0.85 : undefined
        );
        const base64 = dataUrl.split(",")[1] || "";
        resolve({
          mimeType: outMime,
          data: base64,
          name: file.name || "lampiran.jpg",
          previewUrl: dataUrl,
        });
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

interface ChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
  images?: AgriBotImageAttachment[];
  charts?: AgriBotChartSpec[];
  time: string;
  provider?: string;
  model?: string;
  category?: string;
  latencyMs?: number;
  suggestedActions?: SuggestedAction[];
}

interface StarterPrompt {
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  isPhotoTip?: boolean;
}

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: "Ringkas Data IoT & Grafik",
    description: "Area & bar chart tren pH, DO, suhu, dan TDS gaya dark neon",
    prompt:
      "Ringkas data sensor IoT akuaponik saya hari ini dan tampilkan area chart tren air serta bar chart kondisi metrik dengan gaya dark neon.",
    icon: BarChart3,
  },
  {
    title: "Analisis Foto Penyakit",
    description: "Unggah foto daun menguning, busuk akar, atau gejala pada ikan",
    prompt: "",
    icon: Camera,
    isPhotoTip: true,
  },
  {
    title: "Radar & Donat Ekosistem",
    description: "Skor kelayakan ekosistem ECAD & distribusi daya aktuator",
    prompt:
      "Buatkan radar chart skor kelayakan parameter air akuaponik dan donut chart beban daya aktuator dengan gaya emerald.",
    icon: Radar,
  },
  {
    title: "Prediksi Air & Panen GDD",
    description: "Proyeksi hari panen Pakcoy L4 & Kangkung L2 dari data aktual",
    prompt:
      "Analisis kondisi tumbuhan, air, dan ikan saat ini, prediksi gejala dini yang perlu diwaspadai, dan hitung estimasi hari panen Pakcoy serta Kangkung.",
    icon: TrendingUp,
  },
];

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#111827]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-[#F3F4F6] text-[#0B2C1B] font-mono text-[11.5px] font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function tryParseEmbeddedChart(rawCode: string, lang: string): AgriBotChartSpec | null {
  const isChartLang =
    lang === "chart-json" || lang === "chart" || lang === "json";
  if (!isChartLang) return null;

  try {
    const parsed = JSON.parse(rawCode) as Partial<AgriBotChartSpec>;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.chartType === "string" &&
      Array.isArray(parsed.series) &&
      parsed.series.length > 0
    ) {
      return {
        id: parsed.id || `inline-chart-${Math.random().toString(36).slice(2, 7)}`,
        title: parsed.title || "Visualisasi Data IoT",
        subtitle: parsed.subtitle,
        chartType: parsed.chartType,
        labels: Array.isArray(parsed.labels)
          ? parsed.labels.map(String)
          : parsed.series[0].values.map((_, i) => `#${i + 1}`),
        series: parsed.series,
        style: parsed.style,
        summaryNote: parsed.summaryNote,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const cells = parseTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function FormattedMarkdownMessage({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Fenced Code Block (including optional inline chart-json)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim().toLowerCase();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      const rawCode = codeLines.join("\n").trim();
      const chartSpec = tryParseEmbeddedChart(rawCode, lang);
      if (chartSpec) {
        nodes.push(<DynamicChartRenderer key={`embed-${i}`} spec={chartSpec} />);
      } else {
        nodes.push(
          <pre
            key={`code-${i}`}
            className="my-2.5 p-3.5 rounded-2xl bg-[#111827] text-slate-100 text-[11.5px] font-mono overflow-x-auto leading-relaxed"
          >
            <code>{rawCode}</code>
          </pre>
        );
      }
      continue;
    }

    // 2. Markdown Table
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      isSeparatorRow(lines[i + 1])
    ) {
      const headers = parseTableRow(trimmed);
      i += 2; // skip header & separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      nodes.push(
        <div
          key={`tbl-${i}`}
          className="my-3 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white"
        >
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-3.5 py-2.5 font-semibold text-[#111827] whitespace-nowrap"
                  >
                    {renderInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F9FAFB]/70">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-[#374151]">
                      {renderInlineMarkdown(row[cIdx] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 3. Blank Line
    if (!trimmed) {
      nodes.push(<div key={`sp-${i}`} className="h-1.5" />);
      i += 1;
      continue;
    }

    // 4. Headings
    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h4
          key={`h3-${i}`}
          className="text-[13.5px] font-bold text-[#165B39] pt-2 tracking-tight"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const sliceLen = trimmed.startsWith("## ") ? 3 : 2;
      nodes.push(
        <h3
          key={`h2-${i}`}
          className="text-[14.5px] font-bold text-[#111827] pt-2 tracking-tight"
        >
          {renderInlineMarkdown(trimmed.slice(sliceLen))}
        </h3>
      );
      i += 1;
      continue;
    }

    // 5. Blockquote
    if (trimmed.startsWith("> ")) {
      nodes.push(
        <blockquote
          key={`bq-${i}`}
          className="pl-3.5 py-1 my-1 border-l-2 border-[#165B39] text-[#4B5563] italic text-[12.5px]"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      i += 1;
      continue;
    }

    // 6. Bullets
    if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      trimmed.startsWith("• ")
    ) {
      nodes.push(
        <div key={`ul-${i}`} className="flex items-start gap-2.5 pl-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#165B39] mt-2 shrink-0" />
          <div className="flex-1 text-[13px] text-[#1F2937] leading-relaxed">
            {renderInlineMarkdown(trimmed.slice(2))}
          </div>
        </div>
      );
      i += 1;
      continue;
    }

    // 7. Numbered Lists
    const numberedMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
    if (numberedMatch) {
      nodes.push(
        <div key={`ol-${i}`} className="flex items-start gap-2 pl-1">
          <span className="font-mono text-[12px] font-bold text-[#165B39] mt-0.5 shrink-0">
            {numberedMatch[1]}
          </span>
          <div className="flex-1 text-[13px] text-[#1F2937] leading-relaxed">
            {renderInlineMarkdown(numberedMatch[2])}
          </div>
        </div>
      );
      i += 1;
      continue;
    }

    // 8. Horizontal Rule
    if (/^-{3,}$/.test(trimmed)) {
      nodes.push(<hr key={`hr-${i}`} className="my-3 border-[#E5E7EB]" />);
      i += 1;
      continue;
    }

    // 9. Standard Paragraph
    nodes.push(
      <p key={`p-${i}`} className="text-[13px] text-[#1F2937] leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
    i += 1;
  }

  return <div className="space-y-1.5">{nodes}</div>;
}

export function ChatWindow() {
  const { actuators, setActuatorState, systemMeta } = useTelemetry();

  const messages = useSyncExternalStore(
    subscribeAgriBotSession,
    getAgriBotSessionSnapshot,
    getAgriBotServerSnapshot
  );
  const setMessages = useCallback(
    (updater: ChatMsg[] | ((prev: ChatMsg[]) => ChatMsg[])) => {
      const prev = getAgriBotSessionSnapshot();
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeAgriBotSessionMessages(next);
    },
    []
  );
  const [input, setInput] = useState<string>("");
  const [pendingImages, setPendingImages] = useState<AgriBotImageAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<
    Record<string, { ok: boolean; msg: string }>
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // Auto-resize composer textarea cleanly like ChatGPT/Gemini
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 136)}px`;
  }, [input]);

  // Close lightbox with Escape
  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  const appendImageFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      setUploadError(null);

      const remainingSlots = MAX_IMAGES_PER_TURN - pendingImages.length;
      if (remainingSlots <= 0) {
        setUploadError(`Maksimal ${MAX_IMAGES_PER_TURN} gambar per pesan.`);
        return;
      }

      const toProcess = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        setUploadError(
          `Hanya ${remainingSlots} gambar tambahan yang dimuat (maks. ${MAX_IMAGES_PER_TURN} per pesan).`
        );
      }

      const nextAttachments: AgriBotImageAttachment[] = [];
      for (const file of toProcess) {
        try {
          const compressed = await compressImageFile(file);
          nextAttachments.push(compressed);
        } catch (err) {
          setUploadError(
            err instanceof Error ? err.message : "Gagal memproses lampiran gambar."
          );
        }
      }

      if (nextAttachments.length > 0) {
        setPendingImages((prev) =>
          [...prev, ...nextAttachments].slice(0, MAX_IMAGES_PER_TURN)
        );
      }
    },
    [pendingImages.length]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await appendImageFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageFiles = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);

    if (imageFiles.length > 0) {
      e.preventDefault();
      await appendImageFiles(imageFiles);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await appendImageFiles(e.dataTransfer.files);
    }
  };

  const removePendingImage = (idx: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
    setUploadError(null);
  };

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    const imagesToSend = textOverride ? [] : [...pendingImages];

    if ((!text && imagesToSend.length === 0) || isTyping) return;

    const userMsg: ChatMsg = {
      id: nextChatId("u"),
      sender: "user",
      text,
      images: imagesToSend.length > 0 ? imagesToSend : undefined,
      time: formatNowTime(),
    };

    const historyPayload: AgriBotChatTurn[] = messages
      .slice(-10)
      .map((m) => {
        const chartSummary =
          m.charts && m.charts.length > 0
            ? `\n[Grafik ditampilkan: ${m.charts
                .map((c) => `${c.title} (${c.chartType})`)
                .join(", ")}]`
            : "";
        return {
          role: m.sender === "user" ? "user" : "assistant",
          text:
            (m.text ||
              (m.images?.length
                ? "[Mengirim lampiran foto untuk analisis]"
                : "")) + chartSummary,
        };
      });

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) {
      setInput("");
      setPendingImages([]);
    }
    setUploadError(null);
    setIsTyping(true);

    const res = await sendAgriBotChat({
      message: text,
      history: historyPayload,
      images: imagesToSend.length > 0 ? imagesToSend : undefined,
    });
    const latencyMs = res.latencyMs ?? 0;

    setMessages((prev) => [
      ...prev,
      {
        id: nextChatId("b"),
        sender: "bot",
        text: res.reply,
        charts: res.charts ?? [],
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

  const handleCopyReply = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId((prev) => (prev === msgId ? null : prev)), 1800);
    } catch {
      // Clipboard API restricted
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setPendingImages([]);
    setActionFeedback({});
    setUploadError(null);
    setInput("");
    try {
      window.sessionStorage.removeItem(AGRIBOT_SESSION_KEY);
    } catch {
      // Ignore storage restriction
    }
  };

  const canSend =
    !isTyping && (input.trim().length > 0 || pendingImages.length > 0);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative rounded-[24px] lg:rounded-[28px] bg-white border border-[#E5E7EB] shadow-xs flex flex-col overflow-hidden h-[calc(100dvh-160px)] min-h-[520px] max-h-[820px] lg:h-full lg:max-h-none lg:min-h-0"
    >
      {/* Drag-and-Drop Multimodal Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-[#165B39]/10 backdrop-blur-[2px] border-2 border-dashed border-[#165B39] rounded-[24px] lg:rounded-[28px] flex flex-col items-center justify-center p-6 pointer-events-none">
          <div className="h-14 w-14 rounded-2xl bg-[#165B39] text-white flex items-center justify-center shadow-lg mb-3">
            <UploadCloud className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-[#0B2C1B] text-center">
            Lepaskan foto tanaman atau ikan di sini
          </p>
          <p className="text-xs text-[#4B5563] mt-1 text-center">
            AgriBot akan mendiagnosis gejala visual &amp; mencocokkannya dengan data IoT
          </p>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Pilih gambar tanaman atau ikan"
      />

      {/* 1. Minimal Gemini/ChatGPT Top Bar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-[#F3F4F6] flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#165B39] to-[#0B2C1B] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-bold text-[#111827] tracking-tight">
            AgriBot
          </h1>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          disabled={messages.length === 0 || isTyping}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] disabled:opacity-40 text-xs font-medium text-[#374151] transition-colors cursor-pointer disabled:cursor-default shrink-0"
          title="Mulai ulang obrolan"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mulai Ulang Obrolan</span>
        </button>
      </div>

      {/* 2. Pure Centered Conversation Area (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-2.5 sm:py-4">
        <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col">
          {messages.length === 0 ? (
            /* Empty Welcome Canvas matching ChatGPT / Gemini */
            <div className="my-auto w-full flex flex-col items-center py-1 sm:py-3">
              <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br from-[#165B39] via-[#124B2E] to-[#0B2C1B] text-white flex items-center justify-center shadow-sm mb-2 sm:mb-3">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <h2 className="text-lg sm:text-[22px] font-bold tracking-tight text-[#111827] text-center leading-tight">
                Halo, ada yang bisa AgriBot bantu?
              </h2>
              <p className="text-[11.5px] sm:text-[13px] text-[#6B7280] text-center max-w-lg mt-1 leading-snug">
                Unggah foto daun atau ikan untuk diagnosis gejala penyakit, atau minta ringkasan grafik IoT dalam gaya apa pun.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl mt-3.5 sm:mt-5">
                {STARTER_PROMPTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      disabled={isTyping}
                      onClick={() => {
                        if (item.isPhotoTip) {
                          fileInputRef.current?.click();
                        } else {
                          void handleSend(item.prompt);
                        }
                      }}
                      className="text-left p-2.5 sm:p-3 rounded-2xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#165B39] flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#111827] leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#6B7280] mt-0.5 leading-snug line-clamp-2">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Message Stream */
            <div className="space-y-6 pb-2">
              {messages.map((m) =>
                m.sender === "user" ? (
                  <div key={m.id} className="flex flex-col items-end gap-2">
                    {m.images && m.images.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-2 max-w-[88%] sm:max-w-[75%]">
                        {m.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setLightboxUrl(
                                img.previewUrl ||
                                  `data:${img.mimeType};base64,${img.data}`
                              )
                            }
                            className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-2xs hover:opacity-95 transition cursor-zoom-in"
                          >
                            <Image
                              src={
                                img.previewUrl ||
                                `data:${img.mimeType};base64,${img.data}`
                              }
                              alt={img.name || "Lampiran foto"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {m.text && (
                      <div className="max-w-[88%] sm:max-w-[78%] px-4 py-2.5 rounded-[22px] rounded-tr-[6px] bg-[#165B39] text-white text-[13px] leading-relaxed shadow-2xs whitespace-pre-wrap">
                        {m.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start gap-3 sm:gap-3.5">
                    <div className="h-7 w-7 rounded-full bg-[#DCFCE7] border border-[#165B39]/15 text-[#165B39] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono text-[#9CA3AF]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-[#165B39]">
                            AgriBot
                          </span>
                          {m.model && (
                            <span className="truncate">• {m.model}</span>
                          )}
                          {m.latencyMs !== undefined && m.latencyMs > 0 && (
                            <span>• {m.latencyMs}ms</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyReply(m.id, m.text)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition cursor-pointer shrink-0"
                          title="Salin jawaban"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="h-3 w-3 text-[#165B39]" />
                              <span className="text-[#165B39]">Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      <FormattedMarkdownMessage text={m.text} />

                      {/* Dynamic Interactive Multi-Style Charts */}
                      {m.charts && m.charts.length > 0 && (
                        <div className="space-y-3 pt-1">
                          {m.charts.map((chartSpec, cIdx) => (
                            <DynamicChartRenderer
                              key={`${m.id}-chart-${chartSpec.id || cIdx}-${cIdx}`}
                              spec={chartSpec}
                            />
                          ))}
                        </div>
                      )}

                      {/* Discreet Actionable Relay Suggestions */}
                      {m.suggestedActions && m.suggestedActions.length > 0 && (
                        <div className="pt-2.5 mt-2 border-t border-[#F3F4F6] flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] mr-1">
                            Saran Relay:
                          </span>
                          {m.suggestedActions.map((act) => {
                            const key = `${m.id}:${act.actuatorId}`;
                            const liveActuator = actuators[act.actuatorId];
                            const alreadyMatches =
                              liveActuator &&
                              liveActuator.isOn === act.targetState;
                            const isPending = pendingActionKey === key;
                            const feedback = actionFeedback[key];

                            return (
                              <div key={key} className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={alreadyMatches || isPending}
                                  onClick={() =>
                                    handleExecuteSuggestedAction(m.id, act)
                                  }
                                  title={act.reason}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
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
                                    {alreadyMatches
                                      ? `${act.label} (Aktif)`
                                      : act.label}
                                  </span>
                                </button>
                                {feedback && !feedback.ok && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-600">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    <span>{feedback.msg}</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {isTyping && (
                <div className="flex items-start gap-3 sm:gap-3.5">
                  <div className="h-7 w-7 rounded-full bg-[#DCFCE7] border border-[#165B39]/15 text-[#165B39] flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="py-1.5 flex items-center gap-2 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#165B39] animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#165B39] animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#165B39] animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                    <span className="font-mono text-[11px]">
                      AgriBot sedang menganalisis...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* 3. Anchored Rounded Gemini/ChatGPT Pill Composer */}
      <div className="shrink-0 px-3 sm:px-6 pb-3 sm:pb-4 pt-1 bg-white">
        <div className="max-w-3xl mx-auto w-full">
          {uploadError && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{uploadError}</span>
              </span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                aria-label="Tutup peringatan unggahan"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8F9FA] focus-within:bg-white focus-within:border-[#165B39] focus-within:ring-2 focus-within:ring-[#165B39]/10 transition-all px-3.5 pt-2.5 pb-2 shadow-2xs">
            {/* Image Attachment Preview Tray */}
            {pendingImages.length > 0 && (
              <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-[#E5E7EB]/80 overflow-x-auto">
                {pendingImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-16 w-16 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white shrink-0 group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        img.previewUrl && setLightboxUrl(img.previewUrl)
                      }
                      className="block h-full w-full cursor-zoom-in"
                      title={img.name || "Pratinjau foto"}
                    >
                      <Image
                        src={
                          img.previewUrl ||
                          `data:${img.mimeType};base64,${img.data}`
                        }
                        alt={img.name || "Lampiran foto"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePendingImage(idx)}
                      aria-label="Hapus lampiran gambar"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <span className="text-[10.5px] font-mono text-[#6B7280] pl-1 shrink-0">
                  {pendingImages.length}/{MAX_IMAGES_PER_TURN} foto siap dianalisis
                </span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              disabled={isTyping}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Tanya AgriBot, tempel / unggah foto daun atau ikan, atau minta grafik IoT..."
              className="w-full resize-none bg-transparent text-base sm:text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none leading-relaxed max-h-[136px] disabled:opacity-60"
            />

            <div className="flex items-center justify-between gap-2 pt-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isTyping || pendingImages.length >= MAX_IMAGES_PER_TURN}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] disabled:opacity-45 text-xs font-medium text-[#4B5563] transition-colors cursor-pointer disabled:cursor-default"
                  title="Unggah foto daun tanaman atau ikan (PNG/JPG/WEBP, bisa juga drag & drop atau Ctrl+V)"
                >
                  <ImagePlus className="h-4 w-4 shrink-0" />
                  <span>Unggah Foto</span>
                </button>
              </div>

              <button
                type="button"
                disabled={!canSend}
                onClick={() => void handleSend()}
                aria-label="Kirim pesan"
                className="h-8 w-8 rounded-full bg-[#165B39] hover:bg-[#145032] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-[#9CA3AF] text-center mt-1.5 font-mono truncate">
            Terhubung telemetri real-time {systemMeta.edgeNode} • Mendukung analisis foto penyakit &amp; grafik dinamis
          </p>
        </div>
      </div>

      {/* Full-Resolution Image Preview Lightbox Portal */}
      {lightboxUrl &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau gambar lampiran"
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              aria-label="Tutup pratinjau"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] flex items-center justify-center"
            >
              <Image
                src={lightboxUrl}
                alt="Pratinjau penuh lampiran"
                width={1280}
                height={960}
                unoptimized
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
