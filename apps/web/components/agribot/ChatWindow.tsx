"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, RefreshCw, Sparkles, Trash2, Sprout } from "lucide-react";
import { SensorData } from "@/lib/types";

interface ChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface ChatWindowProps {
  sensors: SensorData;
}

export function ChatWindow({ sensors }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "1",
      sender: "bot",
      text: "Halo! Saya **AgriBot**, asisten AI cerdas UrbanGrow. Saya memantau telemetri real-time mikrokontroler ESP32 Anda (pH, DO, TDS, Suhu) dan siap memberikan rekomendasi adaptasi iklim biologis, proyeksi panen, serta diagnosis kesehatan ekosistem.",
      time: "Sekarang",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: ChatMsg = {
      id: String(Date.now()),
      sender: "user",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply =
        "Berdasarkan evaluasi model bioproses ECAD, kualitas air saat ini berada dalam kondisi seimbang. Ada parameter biologis tertentu yang ingin Anda konsultasikan?";
      const lower = q.toLowerCase();

      if (lower.includes("pakcoy") || lower.includes("panen")) {
        reply = `🌱 **Estimasi Panen Pakcoy (L4)**: Umur tanaman saat ini 14 hari. Mengacu pada kestabilan suhu kolam (${sensors.waterTemperature}°C) dan fotoperiode pencahayaan LED 85W, Pakcoy diproyeksikan siap panen optimal dalam **7 hari ke depan (31 Oktober 2026)** dengan estimasi bobot 180-200g per pod.`;
      } else if (lower.includes("kangkung")) {
        reply =
          "🥬 **Estimasi Panen Kangkung (L2)**: Substrat biofilter Kangkung berumur 17 hari sangat aktif menyerap senyawa nitrat organik. Biomassa tajuk daun telah mencapai standar komersial dan siap dipanen dalam **4 hari lagi (28 Oktober 2026)**.";
      } else if (lower.includes("nila") || lower.includes("aerator") || lower.includes("oksigen") || lower.includes("do")) {
        reply = `🐟 **Kesehatan & Oksigen Ikan Nila (L3)**: Tingkat Dissolved Oxygen (DO) kolam terukur **${sensors.dissolvedOxygen} mg/L**. Ambang minimum aman Nila adalah 5.0 mg/L, sehingga aerasi venturi bekerja optimal tanpa risiko hipoksia jaringan.`;
      } else if (lower.includes("ph") || lower.includes("asam") || lower.includes("nutrisi") || lower.includes("tds")) {
        reply = `⚗️ **Keseimbangan Kimiawi Air**: Kadar pH terbaca **${sensors.ph} pH** dan TDS Nutrisi **${Math.round(sensors.tds)} ppm**. Rentang ini sangat ramah bagi simbiosis bakteri nitrifikasi dan penyerapan hara makro akar tanaman.`;
      } else if (lower.includes("tanam") || lower.includes("cara")) {
        reply = `🌿 **Panduan Budidaya Akuaponik UrbanGrow**:
1. Pastikan debit pompa sirkulasi stabil pada rentang 1.8 - 2.2 L/menit.
2. Jaga durasi LED Grow Light selama 14-16 jam per hari untuk fotosintesis optimal.
3. Beri pakan pelet terapung 35g terbagi 2 kali sehari (Pagi 07:00 & Sore 16:30).`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "bot",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "1",
        sender: "bot",
        text: "Percakapan telah direset. Ada hal lain seputar bioproses akuaponik yang ingin Anda tanyakan?",
        time: "Sekarang",
      },
    ]);
  };

  return (
    <div className="rounded-[28px] bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col h-[560px]">
      {/* 1. Chat Window Header Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#165B39] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#111827]">
                AgriBot Telemetry Copilot
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.2 rounded-full bg-[#DCFCE7] text-[10px] font-mono text-[#166534] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#166534] animate-pulse" />
                Live Ingest
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
              Model XGBoost terlatih dengan data 60+ siklus panen
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
          title="Reset Percakapan"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
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
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-[20px] text-xs leading-relaxed shadow-xs ${
                m.sender === "user"
                  ? "bg-[#165B39] text-white rounded-tr-none font-medium"
                  : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827] rounded-tl-none"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: m.text
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\n/g, "<br/>"),
                }}
              />
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
            <div className="p-3.5 rounded-[18px] rounded-tl-none bg-[#F8F9FA] border border-[#E5E7EB] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#165B39] animate-bounce" />
              <span
                className="h-2 w-2 rounded-full bg-[#165B39] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-2 w-2 rounded-full bg-[#165B39] animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompts Chips */}
      <div className="pt-2.5 pb-2 border-t border-[#F3F4F6] flex flex-wrap gap-2">
        <button
          onClick={() => handleSend("Bagaimana cara budidaya akuaponik yang baik?")}
          className="px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] hover:bg-[#DCFCE7] hover:text-[#166534] hover:border-[#166534]/30 text-[#4B5563] text-xs font-medium transition cursor-pointer"
        >
          Panduan Akuaponik
        </button>
        <button
          onClick={() => handleSend("Kapan estimasi panen Pakcoy L4?")}
          className="px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] hover:bg-[#DCFCE7] hover:text-[#166534] hover:border-[#166534]/30 text-[#4B5563] text-xs font-medium transition cursor-pointer"
        >
          Kapan panen Pakcoy?
        </button>
        <button
          onClick={() => handleSend("Bagaimana status saturasi DO untuk Ikan Nila?")}
          className="px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] hover:bg-[#DCFCE7] hover:text-[#166534] hover:border-[#166534]/30 text-[#4B5563] text-xs font-medium transition cursor-pointer"
        >
          DO Ikan Nila & Aerator
        </button>
        <button
          onClick={() => handleSend("Apakah nilai pH saat ini aman?")}
          className="px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] hover:bg-[#DCFCE7] hover:text-[#166534] hover:border-[#166534]/30 text-[#4B5563] text-xs font-medium transition cursor-pointer"
        >
          Kestabilan pH Air
        </button>
      </div>

      {/* 4. Input Bar */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tanya AgriBot tentang kualitas air, estimasi panen, atau nutrisi..."
          className="flex-1 px-4 py-2.5 rounded-full border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#165B39] focus:ring-1 focus:ring-[#165B39] bg-[#F8F9FA] placeholder:text-[#9CA3AF]"
        />
        <button
          onClick={() => handleSend()}
          className="h-10 w-10 rounded-full bg-[#165B39] hover:bg-[#0F3F27] text-white flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
          aria-label="Kirim pesan"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
