"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Boot loader — pure CSS/SVG nervure that materializes segment by segment.
 * Mono counter underneath. No 3D Canvas — keeps boot ultra-fast.
 *
 * The nervure is a vertical sequence of 12 small diamond shapes that pulse
 * alive one after another, with an amber line that draws through them.
 */
export function Loader() {
  const isLoading = useAppStore((s) => s.isLoading);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => Math.min(p + 3, 100));
    }, 38);
    return () => window.clearInterval(t);
  }, []);

  const filledSegments = Math.floor((progress / 100) * 12);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loader-root"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <div className="loader-stage">
            <svg
              viewBox="0 0 80 280"
              className="loader-axis"
              aria-hidden="true"
            >
              {/* Backbone line */}
              <line
                x1="40"
                y1="10"
                x2="40"
                y2="270"
                stroke="rgba(232,236,240,0.06)"
                strokeWidth="1"
              />
              {/* Amber filling line */}
              <motion.line
                x1="40"
                y1="10"
                x2="40"
                y2={10 + (260 * progress) / 100}
                stroke="#FFB454"
                strokeWidth="1.4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              {/* 12 vertebrae diamonds */}
              {Array.from({ length: 12 }).map((_, i) => {
                const y = 14 + i * 22;
                const active = i < filledSegments;
                return (
                  <g key={i}>
                    <polygon
                      points={`40,${y - 5} 47,${y} 40,${y + 5} 33,${y}`}
                      fill={active ? "#131B26" : "transparent"}
                      stroke={active ? "#FFB454" : "rgba(232,236,240,0.18)"}
                      strokeWidth="1"
                      style={{
                        opacity: active ? 1 : 0.4,
                        transition: "all 240ms cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                    {active && (
                      <circle cx="40" cy={y} r="1.6" fill="#FFB454" />
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="loader-meta">
              <span className="loader-eyebrow">SANDRO · SYSTEM BOOT</span>
              <span className="loader-title">
                Architecture <span className="italic">liquide</span>
              </span>
              <span className="loader-counter">
                {String(progress).padStart(3, "0")}
                <span className="loader-counter__pct">%</span>
              </span>
              <span className="loader-version">arch.liquide v1.0</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
