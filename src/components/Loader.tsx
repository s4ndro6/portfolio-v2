"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const STEPS = [
  "Initialisation des systèmes",
  "Chargement de la matière",
  "Calibration caméra",
  "Architecture liquide en ligne",
];

export function Loader() {
  const isLoading = useAppStore((s) => s.isLoading);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 320);
    const t2 = window.setInterval(() => {
      setProgress((p) => Math.min(p + 4, 100));
    }, 50);
    return () => {
      window.clearInterval(t1);
      window.clearInterval(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-void flex flex-col items-center justify-center"
          style={{ zIndex: 100 }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
            <span className="font-mono text-[10px] tracking-[0.3em] text-text-faint uppercase">
              Sandro · System Boot
            </span>

            <span className="font-display text-3xl md:text-5xl text-text text-center leading-tight">
              {STEPS[step]}
              <span className="font-display-italic text-amber">.</span>
            </span>

            <div className="w-full">
              <pre className="font-mono text-[10px] text-text-dim leading-tight whitespace-pre">
                {asciiBar(progress)}
              </pre>
              <div className="flex justify-between mt-2 font-mono text-[10px] text-text-faint">
                <span>{String(progress).padStart(3, "0")}%</span>
                <span>arch.liquide v1.0</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function asciiBar(progress: number, width = 40): string {
  const filled = Math.floor((progress / 100) * width);
  return "[" + "█".repeat(filled) + "·".repeat(Math.max(0, width - filled)) + "]";
}
