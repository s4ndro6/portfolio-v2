"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CLUSTER_LABELS, SKILLS, type SkillCluster } from "@/data/skills";
import { CLUSTER_COLORS } from "@/lib/constants";

const CLUSTERS: SkillCluster[] = [
  "frontend",
  "backend",
  "ai-agents",
  "infra",
  "tools",
];

export function SkillsSection() {
  const [active, setActive] = useState<SkillCluster | null>(null);

  return (
    <section
      id="skills"
      className="scene-section flex items-center"
      style={{ minHeight: "200vh", padding: "6vh 5vw" }}
    >
      <div className="grid grid-cols-12 gap-6 max-w-[88rem] mx-auto w-full items-start">
        <motion.div
          className="col-span-12 md:col-span-4 md:sticky md:top-[18vh] space-y-6"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">Stack · 03</span>
          <h2 className="font-display text-[clamp(2.4rem,5vw,5rem)] leading-[1.02] tracking-tight">
            40 outils.<br />
            <span className="font-display-italic text-text-dim">5 clusters.</span>
          </h2>
          <p className="text-text-dim text-base leading-relaxed max-w-[28rem]">
            La constellation à droite mappe tout ce que j'utilise au quotidien.
            Survolez un cluster pour le mettre en évidence — chaque node est un
            outil que j'ai en main, pas une mention sur LinkedIn.
          </p>
        </motion.div>

        <motion.div
          className="col-span-12 md:col-span-7 md:col-start-6 space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.4, delay: 0.2 }}
        >
          {CLUSTERS.map((cluster, idx) => {
            const isActive = active === cluster;
            const dim = active && !isActive;
            return (
              <div
                key={cluster}
                onMouseEnter={() => setActive(cluster)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(cluster)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                className={`group border-t border-text-faint/30 py-5 transition-opacity duration-300 ${
                  dim ? "opacity-30" : "opacity-100"
                }`}
              >
                <div className="flex items-baseline gap-4 mb-3">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: CLUSTER_COLORS[idx] }}
                  />
                  <span className="font-mono text-xs text-text-dim">
                    [ 0{idx + 1} ]
                  </span>
                  <h3 className="font-display text-2xl tracking-tight">
                    {CLUSTER_LABELS[cluster]}
                  </h3>
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 pl-7">
                  {SKILLS.filter((s) => s.cluster === cluster).map((s) => (
                    <li
                      key={s.name}
                      className={`text-sm transition-colors duration-300 ${
                        isActive ? "text-text" : "text-text-dim"
                      }`}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
