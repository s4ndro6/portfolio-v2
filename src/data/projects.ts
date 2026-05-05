/**
 * 6 projects rendered as portals in the Projects scene.
 * Each portal carries a unique shader hue derived from accent.
 */

import { COLORS } from "@/lib/constants";

export type ProjectStatus = "live" | "production" | "paused" | "ongoing";

export interface Project {
  id: string;
  index: string; // "01" → "06"
  name: string;
  tagline: string;
  status: ProjectStatus;
  year: string;
  url?: string;
  /** Hex color used to tint the portal shader. */
  accent: string;
  /** Tags surfacing tech stack — concise. */
  stack: string[];
  /** 1-2 sentence problem framing. */
  problem: string;
  /** 1-2 sentence solution. */
  solution: string;
  /** Hard numbers — what's real about this project. */
  metrics: { label: string; value: string }[];
  /** Optional outbound link label. */
  cta?: { label: string; href: string };
}

export const PROJECTS: Project[] = [
  {
    id: "fluvo",
    index: "01",
    name: "Fluvo",
    tagline: "SaaS 360° pour agences",
    status: "live",
    year: "2025",
    url: "https://fluvo.app",
    accent: COLORS.amber,
    stack: ["Next.js", "FastAPI", "Postgres", "Stripe", "Multi-agents"],
    problem:
      "Les agences pilotent leurs clients depuis 7 outils déconnectés — CRM, facturation, contenu, prospection, analytics. Personne ne voit le tableau complet.",
    solution:
      "Une seule console qui agrège tout, augmentée par 3 agents IA spécialisés (contenu, prospection, exécution) qui travaillent pendant que le client dort.",
    metrics: [
      { label: "Lignes de code", value: "20k+" },
      { label: "Endpoints API", value: "201" },
      { label: "Modules métier", value: "11" },
    ],
    cta: { label: "Voir Fluvo", href: "https://fluvo.app" },
  },
  {
    id: "alternance-hunt",
    index: "02",
    name: "Alternance Hunt",
    tagline: "Pipeline candidatures autonome",
    status: "production",
    year: "2025",
    url: "https://alternance-hunt.vercel.app",
    accent: COLORS.indigo,
    stack: ["n8n", "Next.js", "Supabase", "PayPal", "Gmail API"],
    problem:
      "Trouver une alternance B2 demande 200+ candidatures manuelles, lettres personnalisées, follow-ups. Impossible à tenir en parallèle des études.",
    solution:
      "Pipeline n8n qui scrape WTTJ + France Travail, génère lettres avec Claude, envoie via Gmail, track les réponses, relance après 7 jours. Zéro saisie manuelle.",
    metrics: [
      { label: "Candidatures auto", value: "330+" },
      { label: "Réponses positives", value: "12%" },
      { label: "Heures gagnées/sem", value: "~25h" },
    ],
    cta: { label: "Voir le live", href: "https://alternance-hunt.vercel.app" },
  },
  {
    id: "nexus-agent",
    index: "03",
    name: "NEXUS Agent V11",
    tagline: "Agent IA local-first",
    status: "ongoing",
    year: "2025",
    accent: COLORS.teal,
    stack: ["LangGraph", "Ollama", "Qdrant", "FastAPI", "SearxNG"],
    problem:
      "Les assistants IA cloud sont chers, lents et exfiltrent les données. Pour un usage perso intensif (recherche, code, synthèse), il faut du local.",
    solution:
      "Agent multi-tool tournant 100% sur RTX 4070 — qwen2.5-coder + gemma3, mémoire vectorielle Qdrant, web search SearxNG, traces Langfuse. Routeur sémantique + bayésien.",
    metrics: [
      { label: "Tools intégrés", value: "14" },
      { label: "Modèles locaux", value: "5" },
      { label: "Coût API/mois", value: "0€" },
    ],
  },
  {
    id: "arcane-fury",
    index: "04",
    name: "Arcane Fury",
    tagline: "Combat magique VR",
    status: "paused",
    year: "2024",
    accent: COLORS.violet,
    stack: ["Unity 6.4", "Meta Quest 3S", "ConfigurableJoint", "C#"],
    problem:
      "Les jeux VR de combat se contentent de pointer-cliquer avec une wand. Aucun ne propose une physique de sort qui réagit vraiment à ton geste.",
    solution:
      "Combat physique full-body — ConfigurableJoint pour ragdoll, 3 écoles de magie distinctes (kinésie, pyromancie, foudre), feedback haptique. Démo jouable.",
    metrics: [
      { label: "Écoles de magie", value: "3" },
      { label: "Sorts implémentés", value: "12" },
      { label: "FPS Quest 3S", value: "72" },
    ],
  },
  {
    id: "lea-hugo-noam",
    index: "05",
    name: "Léa · Hugo · Noam",
    tagline: "3 agents IA en prod dans Fluvo",
    status: "production",
    year: "2025",
    accent: COLORS.cyanDeep,
    stack: ["LangGraph", "Claude Sonnet", "n8n", "Postgres"],
    problem:
      "Une agence ne peut pas scaler son contenu, sa prospection ET son exécution sans recruter — chaque tâche a sa propre logique métier qui ne se délègue pas à un agent générique.",
    solution:
      "Trois personas spécialisés : Léa (contenu — copy, briefs, calendriers), Hugo (prospection — sourcing, outreach, qualification), Noam (exécution — onboarding, relances, livraisons). Chacun avec ses tools dédiés.",
    metrics: [
      { label: "Agents en prod", value: "3" },
      { label: "Tasks/jour auto", value: "~40" },
      { label: "Adoption clients", value: "100%" },
    ],
  },
  {
    id: "jarvis",
    index: "06",
    name: "Jarvis",
    tagline: "Setup Claude Code WSL personnel",
    status: "ongoing",
    year: "2025",
    accent: COLORS.slate,
    stack: ["Claude Code", "WSL2", "MCP", "Bash hooks", "Obsidian sync"],
    problem:
      "Claude Code de base est puissant mais générique. Pour shipper en solo sur 4 projets simultanés, il faut un terminal qui connaît mes conventions, mes skills, mes raccourcis.",
    solution:
      "Setup custom — 10 skills métier (cv, prospection, n8n, trading…), 12 commandes slash, 4 MCP (memory, sequentialthinking, ffuf, sqlmap), 3 hooks de validation, sync Obsidian sur /save.",
    metrics: [
      { label: "Skills custom", value: "10" },
      { label: "Slash commands", value: "12" },
      { label: "Score perso", value: "8.5/10" },
    ],
  },
];
