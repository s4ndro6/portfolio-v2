"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { PROJECTS } from "@/data/projects";
import { useAppStore } from "@/store/useAppStore";

const STATUS_LABEL: Record<string, string> = {
  live: "● Live",
  production: "● En production",
  ongoing: "○ Construction active",
  paused: "◌ En pause",
};

export function ProjectModal() {
  const openId = useAppStore((s) => s.openProject);
  const close = () => useAppStore.getState().setOpenProject(null);
  const project = openId ? PROJECTS.find((p) => p.id === openId) : null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openId]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4 md:p-8"
          style={{ zIndex: 80 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={close}
            className="absolute inset-0 bg-void/80 backdrop-blur-md cursor-none"
          />
          <motion.article
            role="dialog"
            aria-labelledby={`modal-title-${project.id}`}
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-mid border border-text-faint/30 p-6 md:p-12"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-baseline justify-between gap-4 mb-8">
              <span className="font-mono text-xs text-text-faint">
                {project.index} / {String(PROJECTS.length).padStart(2, "0")}
              </span>
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase"
                style={{ color: project.accent }}
              >
                {STATUS_LABEL[project.status]}
              </span>
            </header>

            <h3
              id={`modal-title-${project.id}`}
              className="font-display text-4xl md:text-6xl tracking-tight leading-[1.02] mb-2"
            >
              {project.name}
            </h3>
            <p className="font-display-italic text-text-dim text-2xl mb-10">
              {project.tagline} · {project.year}
            </p>

            <div className="space-y-6 mb-10">
              <Block label="Le problème" body={project.problem} />
              <Block label="La solution" body={project.solution} />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-text-faint/20 mb-10">
              {project.metrics.map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="font-mono text-2xl text-text">{m.value}</span>
                  <span className="eyebrow text-text-faint mt-1">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="text-xs px-3 py-1 border border-text-faint/40 text-text-dim font-mono"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between pt-6 border-t border-text-faint/20">
              {project.cta ? (
                <a
                  href={project.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-xl text-amber underline decoration-amber/40 hover:decoration-amber transition-all"
                >
                  {project.cta.label} →
                </a>
              ) : (
                <span className="font-display-italic text-text-dim">
                  Privé · démo sur demande
                </span>
              )}
              <button
                type="button"
                onClick={close}
                className="font-mono text-xs tracking-[0.2em] uppercase text-text-dim hover:text-amber transition-colors"
              >
                Fermer · ESC
              </button>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <span className="eyebrow block mb-2">{label}</span>
      <p className="text-text leading-relaxed text-lg">{body}</p>
    </div>
  );
}
