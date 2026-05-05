"use client";

import { motion } from "framer-motion";

export function HubSection() {
  return (
    <section
      id="hub"
      className="scene-section flex flex-col justify-between"
      style={{ minHeight: "200vh", padding: "6vh 5vw" }}
    >
      {/* Top bar — eyebrow */}
      <motion.header
        className="flex items-center justify-between gap-6 sticky top-0 pt-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <span className="eyebrow">Lille · 2026 · Architecture liquide</span>
        <span className="eyebrow text-amber">● Disponible alternance B2</span>
      </motion.header>

      {/* Hero — first viewport */}
      <div className="grid grid-cols-12 gap-6 items-end pb-[12vh]">
        <motion.h1
          className="col-span-12 md:col-span-9 font-display text-[clamp(3rem,9vw,9.5rem)] leading-[0.92] tracking-[-0.03em]"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          <span className="block">Sandro</span>
          <span className="block font-display-italic text-text-dim">
            Schillaci
          </span>
        </motion.h1>

        <motion.div
          className="col-span-12 md:col-span-3 flex flex-col gap-3 text-text-dim text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.0 }}
        >
          <span className="font-mono text-xs">[ 01 / 05 ] HUB</span>
          <p className="text-text leading-relaxed">
            Solo full-stack AI builder. <br />
            Systèmes qui tournent. Pas de slides.
          </p>
        </motion.div>
      </div>

      {/* Bottom — scroll indicator */}
      <motion.div
        className="flex items-end justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.4 }}
      >
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Défilez · Traversez</span>
          <span className="font-mono text-xs text-text-faint">
            5 environnements · 1 caméra continue
          </span>
        </div>
        <motion.div
          className="w-px h-16 bg-text-dim/40 origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
