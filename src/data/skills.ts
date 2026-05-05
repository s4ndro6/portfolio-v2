/**
 * 40 skills organized in 5 clusters.
 * Each cluster maps to a CLUSTER_COLORS index for the constellation.
 */

export type SkillCluster =
  | "frontend"
  | "backend"
  | "ai-agents"
  | "infra"
  | "tools";

export interface Skill {
  name: string;
  cluster: SkillCluster;
  /** Relative weight 0-1 — drives node radius in constellation. */
  weight: number;
}

export const CLUSTER_LABELS: Record<SkillCluster, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "ai-agents": "AI · Agents",
  infra: "Infra · Cloud",
  tools: "Tools · Workflow",
};

export const CLUSTER_INDEX: Record<SkillCluster, number> = {
  frontend: 0,
  backend: 1,
  "ai-agents": 2,
  infra: 3,
  tools: 4,
};

export const SKILLS: Skill[] = [
  // Frontend (8)
  { name: "Next.js", cluster: "frontend", weight: 1 },
  { name: "React", cluster: "frontend", weight: 1 },
  { name: "TypeScript", cluster: "frontend", weight: 0.9 },
  { name: "Three.js", cluster: "frontend", weight: 0.8 },
  { name: "R3F", cluster: "frontend", weight: 0.75 },
  { name: "GSAP", cluster: "frontend", weight: 0.7 },
  { name: "Tailwind", cluster: "frontend", weight: 0.85 },
  { name: "Framer Motion", cluster: "frontend", weight: 0.6 },

  // Backend (8)
  { name: "Python 3.12", cluster: "backend", weight: 1 },
  { name: "FastAPI", cluster: "backend", weight: 0.9 },
  { name: "Node", cluster: "backend", weight: 0.8 },
  { name: "PostgreSQL", cluster: "backend", weight: 0.75 },
  { name: "Supabase", cluster: "backend", weight: 0.8 },
  { name: "Redis", cluster: "backend", weight: 0.55 },
  { name: "Pydantic", cluster: "backend", weight: 0.7 },
  { name: "REST · OpenAPI", cluster: "backend", weight: 0.65 },

  // AI · Agents (8)
  { name: "LangGraph", cluster: "ai-agents", weight: 1 },
  { name: "Claude API", cluster: "ai-agents", weight: 0.95 },
  { name: "Ollama", cluster: "ai-agents", weight: 0.85 },
  { name: "Qdrant", cluster: "ai-agents", weight: 0.7 },
  { name: "RAG", cluster: "ai-agents", weight: 0.8 },
  { name: "MCP", cluster: "ai-agents", weight: 0.75 },
  { name: "Prompt Eng.", cluster: "ai-agents", weight: 0.85 },
  { name: "Browser-use", cluster: "ai-agents", weight: 0.55 },

  // Infra · Cloud (8)
  { name: "Vercel", cluster: "infra", weight: 0.9 },
  { name: "Docker", cluster: "infra", weight: 0.75 },
  { name: "WSL2", cluster: "infra", weight: 0.7 },
  { name: "Cloudflare", cluster: "infra", weight: 0.55 },
  { name: "Linux", cluster: "infra", weight: 0.7 },
  { name: "Nginx", cluster: "infra", weight: 0.5 },
  { name: "GitHub Actions", cluster: "infra", weight: 0.6 },
  { name: "Langfuse", cluster: "infra", weight: 0.5 },

  // Tools · Workflow (8)
  { name: "n8n", cluster: "tools", weight: 0.95 },
  { name: "Claude Code", cluster: "tools", weight: 1 },
  { name: "Git", cluster: "tools", weight: 0.85 },
  { name: "Figma", cluster: "tools", weight: 0.65 },
  { name: "Obsidian", cluster: "tools", weight: 0.7 },
  { name: "PayPal API", cluster: "tools", weight: 0.5 },
  { name: "SearxNG", cluster: "tools", weight: 0.45 },
  { name: "Unity 6", cluster: "tools", weight: 0.6 },
];
