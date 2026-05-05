"use client";

import { motion } from "framer-motion";

const CTAS = [
  {
    label: "Email",
    href: "mailto:alessandroschillaci05@yahoo.com",
    detail: "alessandroschillaci05@yahoo.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/s4ndro6",
    detail: "@s4ndro6",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/sandrosch",
    detail: "/in/sandrosch",
  },
  {
    label: "Fluvo.app",
    href: "https://fluvo.app",
    detail: "Le projet vivant",
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="scene-section flex flex-col justify-center"
      style={{ minHeight: "200vh", padding: "6vh 5vw" }}
    >
      <div className="max-w-[88rem] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          <span className="eyebrow">Contact · 05</span>
          <h2 className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.95] tracking-[-0.03em] max-w-[14ch]">
            On construit{" "}
            <span className="font-display-italic text-amber">quelque chose</span>?
          </h2>

          <p className="text-text-dim text-xl max-w-[40rem] leading-relaxed">
            Disponible pour une alternance B2 dès septembre 2026. Aussi ouvert
            aux missions courtes : audits IA, automation n8n, agents LangGraph.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[60rem] pt-10">
            {CTAS.map((cta, i) => (
              <motion.a
                key={cta.label}
                href={cta.href}
                target={cta.href.startsWith("http") ? "_blank" : undefined}
                rel={cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group block border border-text-faint/30 p-6 hover:border-amber transition-colors duration-300 bg-mid/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <span className="block font-display text-2xl mb-2 group-hover:text-amber transition-colors">
                  {cta.label}
                </span>
                <span className="font-mono text-xs text-text-dim block truncate">
                  {cta.detail}
                </span>
                <span className="block mt-4 text-sm text-text-dim group-hover:text-amber group-hover:translate-x-1 transition-all">
                  →
                </span>
              </motion.a>
            ))}
          </div>

          <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-text-faint/20">
            <div className="space-y-1">
              <span className="font-display-italic text-text-dim text-2xl">
                Sandro Schillaci
              </span>
              <span className="block font-mono text-xs text-text-faint">
                Lille · 2026 · Solo
              </span>
            </div>
            <span className="font-mono text-xs text-text-faint">
              Architecture Liquide v1 — Built with Next.js 16, R3F 9, GSAP, Lenis
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
