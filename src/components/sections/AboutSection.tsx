"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const ANCHORS: Record<string, string> = {
  solo: "Pas de cofondateur, pas d'équipe — chaque ligne de code, chaque pixel, chaque deploy passe par moi. C'est un choix : la friction de l'alignement disparaît, la vitesse d'itération est maximale.",
  hyperfocus:
    "TDA. Quand un problème m'attrape, j'y suis 14 heures sans lever la tête. C'est asymétrique : médiocre en multitâche, redoutable en concentration profonde.",
  ship: "Tout ce que je construis va en prod. Pas de POC qui meurt sur disque, pas de slide-deck. Si ça ne tourne pas devant un user, ça n'existe pas.",
};

export function AboutSection() {
  const [open, setOpen] = useState<keyof typeof ANCHORS | null>(null);

  return (
    <section
      id="about"
      className="scene-section flex items-center"
      style={{ minHeight: "200vh", padding: "6vh 5vw" }}
    >
      <div className="grid grid-cols-12 gap-6 max-w-[88rem] mx-auto w-full items-start">
        <div className="col-span-12 md:col-span-3 sticky top-[18vh]">
          <span className="eyebrow">À propos · 02</span>
          <span className="block divider-amber mt-3" />
        </div>

        <motion.div
          className="col-span-12 md:col-span-8 md:col-start-5 space-y-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-[clamp(2rem,4.4vw,4.5rem)] leading-[1.05] tracking-tight">
            J'ai 20 ans. Je suis{" "}
            <Anchor word="solo" open={open} setOpen={setOpen} />, je vis en{" "}
            <Anchor word="hyperfocus" open={open} setOpen={setOpen} />, et je
            n'écris jamais de code que je ne <Anchor word="ship" open={open} setOpen={setOpen} /> pas.
          </h2>

          <p className="text-lg leading-[1.7] text-text-dim max-w-[42rem]">
            Lille. Étudiant Ynov B1, en recherche d'une alternance B2 pour
            septembre 2026. Avant Ynov, j'ai shipé Fluvo — un SaaS 360° pour
            agences, 20 000 lignes de code, 201 endpoints, 11 modules métier,
            seul. C'est en construisant ce truc que j'ai compris ce que voulait
            dire <em className="font-display-italic text-text">builder</em> : pas
            ajouter des features, mais tenir un système entier en tête, jour
            après jour, sans casser ce qui tourne.
          </p>

          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="border-l border-amber/60 pl-6 py-3 max-w-[40rem]"
            >
              <span className="eyebrow text-amber mb-2 block">
                {open}
              </span>
              <p className="text-text leading-relaxed">{ANCHORS[open]}</p>
            </motion.div>
          )}

          <div className="flex gap-4 flex-wrap pt-4">
            <Stat label="Année" value="2026" />
            <Stat label="Projets en prod" value="3" />
            <Stat label="Lignes shipées" value="40k+" />
            <Stat label="Heures Claude Code" value="∞" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Anchor({
  word,
  open,
  setOpen,
}: {
  word: keyof typeof ANCHORS;
  open: string | null;
  setOpen: (w: keyof typeof ANCHORS | null) => void;
}) {
  const isOpen = open === word;
  return (
    <button
      type="button"
      onClick={() => setOpen(isOpen ? null : word)}
      className={`font-display-italic transition-colors duration-300 ${
        isOpen ? "text-amber" : "text-text underline decoration-text-faint underline-offset-[0.18em] decoration-[1px]"
      } hover:text-amber`}
      aria-expanded={isOpen}
    >
      {word}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border border-text-faint/30">
      <span className="font-mono text-2xl text-text">{value}</span>
      <span className="eyebrow text-text-faint">{label}</span>
    </div>
  );
}
