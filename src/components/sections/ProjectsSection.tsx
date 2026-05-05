"use client";

import { motion } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import { useAppStore } from "@/store/useAppStore";

const STATUS_LABEL: Record<string, string> = {
  live: "● Live",
  production: "● Production",
  ongoing: "○ En cours",
  paused: "◌ En pause",
};

export function ProjectsSection() {
  const setOpenProject = useAppStore((s) => s.setOpenProject);

  return (
    <section
      id="projects"
      className="scene-section flex flex-col"
      style={{ minHeight: "300vh", padding: "6vh 5vw" }}
    >
      <div className="grid grid-cols-12 gap-6 max-w-[88rem] mx-auto w-full mb-[8vh]">
        <div className="col-span-12 md:col-span-6">
          <span className="eyebrow">Projets · 04</span>
          <h2 className="font-display text-[clamp(2.4rem,5vw,5rem)] leading-[1.02] tracking-tight mt-3">
            Six portails.<br />
            <span className="font-display-italic text-text-dim">
              Six systèmes en production.
            </span>
          </h2>
        </div>
        <div className="col-span-12 md:col-span-5 md:col-start-8 flex items-end">
          <p className="text-text-dim leading-relaxed">
            Chaque carte ouvre un case study : le problème réel, la solution
            shippée, et les chiffres qui le valident. Pas de mock, pas de wireframe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 max-w-[88rem] mx-auto w-full">
        {PROJECTS.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setOpenProject(p.id)}
            className="col-span-12 md:col-span-6 group text-left p-6 md:p-8 border border-text-faint/30 hover:border-amber transition-colors duration-300 bg-mid/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
            aria-label={`Ouvrir ${p.name}`}
          >
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <span className="font-mono text-xs text-text-faint">{p.index}</span>
              <span className="font-mono text-[10px] tracking-widest text-text-dim uppercase">
                {STATUS_LABEL[p.status]}
              </span>
            </div>

            <h3 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
              {p.name}
            </h3>
            <p className="font-display-italic text-text-dim text-lg mb-6">
              {p.tagline}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {p.stack.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-1 border border-text-faint/40 text-text-dim font-mono"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-text-faint/20">
              {p.metrics.map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="font-mono text-base text-text">{m.value}</span>
                  <span className="eyebrow text-text-faint mt-1">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-text-dim group-hover:text-amber transition-colors">
                Lire le case study
              </span>
              <span className="text-text-dim group-hover:text-amber group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
