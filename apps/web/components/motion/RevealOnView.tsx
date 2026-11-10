"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealOnViewProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  yOffset?: number;
  threshold?: number;
}

export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold: number = 0.14
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      const immediate = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(immediate);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -24px 0px",
      }
    );

    observer.observe(el);

    // Fallback safety in case headless captures skip intersection ticks
    const safetyTimer = setTimeout(() => {
      setInView(true);
      observer.disconnect();
    }, 1800);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, inView };
}

export function RevealOnView({
  children,
  delayMs = 0,
  className = "",
  yOffset = 16,
  threshold = 0.12,
}: RevealOnViewProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(threshold);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: inView ? `${delayMs}ms` : "0ms",
        transform: inView ? "translate3d(0, 0, 0)" : `translate3d(0, ${yOffset}px, 0)`,
      }}
      className={`transition-[opacity,transform] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] ${
        inView ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

