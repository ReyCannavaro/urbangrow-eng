"use client";

import React from "react";
import { ChatWindow } from "@/components/agribot/ChatWindow";

export default function AgriBotPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ChatWindow />
    </div>
  );
}
