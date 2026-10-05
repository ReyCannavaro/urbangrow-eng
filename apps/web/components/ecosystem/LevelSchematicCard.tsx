"use client";

import React from "react";

interface LevelSchematicCardProps {
  levelNumber: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  latinName: string;
  description: string;
  primaryMetric: string;
  primaryMetricColor: string;
  secondaryInfo: string;
}

export function LevelSchematicCard({
  levelNumber,
  badgeBg,
  badgeText,
  title,
  latinName,
  description,
  primaryMetric,
  primaryMetricColor,
  secondaryInfo,
}: LevelSchematicCardProps) {
  return (
    <div className="rounded-[24px] bg-white border border-[var(--border-light)] p-5 shadow-xs relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`h-9 w-9 rounded-2xl ${badgeBg} ${badgeText} flex items-center justify-center font-mono font-bold text-xs`}
          >
            {levelNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{title}</h3>
              <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {latinName}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="text-right font-mono shrink-0">
          <div className={`text-xs font-bold ${primaryMetricColor}`}>{primaryMetric}</div>
          <div className="text-[11px] text-[var(--text-muted)]">{secondaryInfo}</div>
        </div>
      </div>
    </div>
  );
}
