export interface Project {
  id: string;
  nodeIndex: number;
  angleOffset: number;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  url?: string;
  worldComponent: string;
  accentColor: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'fluvo',
    nodeIndex: 1,
    angleOffset: Math.PI * 0.25,
    name: 'Fluvo',
    tagline: "L'agence qui se gère elle-même.",
    description:
      'SaaS 360° pour agences. CRM, outbound auto, portail client, Stripe MRR, 3 agents IA. 20k+ LOC, 201 endpoints, 28 tables en production.',
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Stripe', 'Resend', 'HF Spaces'],
    url: 'https://fluvo.app',
    worldComponent: 'WorldFluvo',
    accentColor: '#5B8DEE',
  },
  {
    id: 'hunt',
    nodeIndex: 2,
    angleOffset: -Math.PI * 0.3,
    name: 'Alternance Hunt',
    tagline: '330+ candidatures envoyées sans bouger.',
    description:
      'Pipeline n8n autonome. 6 sources scrapées, scoring Groq, envoi Gmail + LBA API. Live en SaaS 49€/149€.',
    stack: ['n8n', 'Groq', 'Next.js', 'PayPal', 'Gmail API', 'LBA API'],
    url: 'https://alternance-hunt.vercel.app',
    worldComponent: 'WorldHunt',
    accentColor: '#34D399',
  },
  {
    id: 'nexus',
    nodeIndex: 3,
    angleOffset: Math.PI * 0.5,
    name: 'NEXUS Agent',
    tagline: 'Agent IA 100% local qui voit, navigue et exécute.',
    description:
      'Agent autonome FastAPI. LangGraph 7 nœuds, browser-use CDP, vision Ollama only, Qdrant embedded, SearxNG self-hosted.',
    stack: ['LangGraph', 'FastAPI', 'Ollama', 'Qdrant', 'browser-use', 'SearxNG'],
    worldComponent: 'WorldNexus',
    accentColor: '#22D3EE',
  },
  {
    id: 'arcane',
    nodeIndex: 4,
    angleOffset: -Math.PI * 0.15,
    name: 'Arcane Fury',
    tagline: 'Combat VR avec physique réelle.',
    description:
      'Jeu Unity 6.4 LTS pour Meta Quest 3S. ConfigurableJoint, 3 écoles de magie, ragdoll dynamique. MCP Unity dans le pipeline.',
    stack: ['Unity 6.4', 'C#', 'Meta Quest 3S', 'VR', 'Physics'],
    worldComponent: 'WorldArcane',
    accentColor: '#FF6B35',
  },
  {
    id: 'agents',
    nodeIndex: 5,
    angleOffset: Math.PI * 0.4,
    name: 'Léa · Hugo · Noam',
    tagline: 'Mon équipe IA intégrée dans Fluvo.',
    description:
      '3 agents spécialisés orchestrés LangGraph. Contenu, prospection, exécution. Architecture multi-agents en production dans Fluvo.',
    stack: ['LangGraph', 'Claude', 'Groq', 'OpenRouter', 'RAG', 'Tools'],
    worldComponent: 'WorldAgents',
    accentColor: '#A78BFA',
  },
  {
    id: 'jarvis',
    nodeIndex: 6,
    angleOffset: -Math.PI * 0.45,
    name: 'Jarvis',
    tagline: 'Mon assistant terminal personnel.',
    description:
      'Claude Code WSL avec 10 skills custom, 12 commandes slash, 4 MCP (context7, playwright, n8n, github), 3 hooks. Sync Obsidian. Score 8.5/10.',
    stack: ['Claude Code', 'MCP', 'WSL Ubuntu', 'Bash', 'Obsidian', 'n8n'],
    worldComponent: 'WorldJarvis',
    accentColor: '#4ADE80',
  },
];
