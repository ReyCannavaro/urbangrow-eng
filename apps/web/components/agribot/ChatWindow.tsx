"use client";

import React, { useState } from "react";
import { Send, Bot, RefreshCw } from "lucide-react";
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
      text: "Halo! Saya AgriBot, asisten kecerdasan buatan UrbanGrow. Saya siap membantu menjawab pertanyaan seputar kesehatan ikan, nutrisi tanaman, estimasi panen, hingga stabilitas kualitas air. Ada yang bisa saya bantu?",
      time: "Sekarang",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

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
        "Berdasarkan evaluasi model AI ECAD kami, kondisi ekosistem saat ini seimbang dengan skor adaptasi iklim 96.2%. Ada hal spesifik yang ingin kamu tanyakan?";
      const lower = q.toLowerCase();

      if (lower.includes("pakcoy") || lower.includes("panen")) {
        reply = `🌱 **Estimasi Panen Pakcoy**: Umur tanaman saat ini 14 hari. Berdasarkan suhu air (${sensors.waterTemperature}°C) dan siklus pencahayaan, Pakcoy diproyeksikan siap panen optimal dalam **7 hari ke depan** dengan target bobot 180-200 gram per pod.`;
      } else if (lower.includes("kangkung")) {
        reply =
          "🥬 **Estimasi Panen Kangkung**: Kangkung berumur 17 hari di Level 2 berfungsi sangat aktif menyerap nitrat. Daun dan batang telah mencapai ukuran komersial, siap dipetik dalam **4 hari lagi**.";
      } else if (lower.includes("nila") || lower.includes("aerator") || lower.includes("oksigen")) {
        reply = `🐟 **Manajemen Oksigen Ikan Nila**: Ikan Nila di Level 3 membutuhkan DO > 5.0 mg/L. Saat ini DO terukur **${sensors.dissolvedOxygen} mg/L** (Sangat Aman). Aerator otomatis menjaga agar Nila tidak stres pernapasan.`;
      } else if (lower.includes("ph") || lower.includes("asam")) {
        reply = `⚗️ **Keseimbangan pH**: pH air terbaca **${sensors.ph}**. Rentang aman biologis adalah 6.5 - 7.5. Jika terjadi penurunan tajam ke bawah 6.4, sistem akan memberikan notifikasi untuk menambahkan buffer kalsium karbonat.`;
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
    }, 800);
  };

  return (
    <div className="rounded-[28px] bg-white border border-[var(--border-light)] p-5 shadow-xs flex flex-col h-[520px]">
      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "bot" && (
              <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-800">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                m.sender === "user"
                  ? "bg-[var(--bg-charcoal)] text-white rounded-tr-none"
                  : "bg-stone-50 border border-stone-200/60 text-stone-800 rounded-tl-none"
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
              <span className="text-[10px] opacity-60 block mt-1.5 text-right font-mono">{m.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>AgriBot sedang memproses data telemetri...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div className="pt-3 pb-2 border-t border-stone-100 flex flex-wrap gap-2">
        <button
          onClick={() => handleSend("Bagaimana cara menanam yang baik?")}
          className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition cursor-pointer"
        >
          Bagaimana cara menanam yang baik?
        </button>
        <button
          onClick={() => handleSend("Kapan estimasi waktu panen Pakcoy?")}
          className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition cursor-pointer"
        >
          Kapan panen Pakcoy?
        </button>
        <button
          onClick={() => handleSend("Apakah DO Ikan Nila aman jika aerator mati?")}
          className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition cursor-pointer"
        >
          DO Ikan Nila & Aerator
        </button>
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tanya AgriBot tentang kualitas air, estimasi panen, atau nutrisi..."
          className="flex-1 px-4 py-2.5 rounded-full border border-stone-200 text-xs focus:outline-none focus:border-stone-500 bg-stone-50/50"
        />
        <button
          onClick={() => handleSend()}
          className="h-9 w-9 rounded-full bg-[var(--bg-charcoal)] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
