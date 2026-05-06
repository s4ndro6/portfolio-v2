export interface Project {
  id: string;
  index: number;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  url?: string;
  color: string;
  nodeY: number;
  angle: number;
  branchLen: number;
}

export const PROJECTS: Project[] = [
  {
    id: 'fluvo',
    index: 0,
    name: 'Fluvo',
    tagline: "L'agence qui se gère elle-même.",
    description:
      'SaaS 360° pour agences digitales. CRM, outbound auto, portail client, Stripe MRR, 3 agents IA. 20k LOC, 201 endpoints, 28 tables.',
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Stripe', 'Resend'],
    url: 'https://fluvo.app',
    color: '#5B8DEE',
    nodeY: 9,
    angle: 0.0,
    branchLen: 7,
  },
  {
    id: 'hunt',
    index: 1,
    name: 'Alternance Hunt',
    tagline: '330+ candidatures envoyées sans bouger.',
    description:
      'Pipeline n8n autonome. 6 sources scrapées, scoring Groq, envoi Gmail + LBA API.',
    stack: ['n8n', 'Groq', 'Next.js', 'Gmail API'],
    url: 'https://alternance-hunt.vercel.app',
    color: '#34D399',
    nodeY: 5,
    angle: Math.PI / 3,
    branchLen: 7,
  },
  {
    id: 'nexus',
    index: 2,
    name: 'NEXUS Agent',
    tagline: 'Agent IA local qui voit et navigue.',
    description:
      'FastAPI + LangGraph 7 nœuds, browser-use CDP, vision Ollama only, Qdrant.',
    stack: ['LangGraph', 'FastAPI', 'Ollama', 'Qdrant'],
    color: '#22D3EE',
    nodeY: 1,
    angle: (Math.PI * 2) / 3,
    branchLen: 7,
  },
  {
    id: 'arcane',
    index: 3,
    name: 'Arcane Fury',
    tagline: 'Combat VR avec physique réelle.',
    description:
      'Jeu Unity 6.4 LTS Meta Quest 3S. ConfigurableJoint, 3 écoles de magie, ragdoll.',
    stack: ['Unity 6.4', 'C#', 'Meta Quest 3S', 'VR'],
    color: '#FF6B35',
    nodeY: -3,
    angle: Math.PI,
    branchLen: 7,
  },
  {
    id: 'agents',
    index: 4,
    name: 'Léa · Hugo · Noam',
    tagline: 'Mon équipe IA dans Fluvo.',
    description:
      '3 agents LangGraph spécialisés en prod dans Fluvo. Contenu, prospection, exécution.',
    stack: ['LangGraph', 'Claude', 'Groq', 'RAG'],
    color: '#A78BFA',
    nodeY: -7,
    angle: (Math.PI * 4) / 3,
    branchLen: 7,
  },
  {
    id: 'jarvis',
    index: 5,
    name: 'Jarvis',
    tagline: 'Mon terminal augmenté.',
    description:
      'Claude Code WSL, 10 skills custom, 12 commandes, 4 MCP, 3 hooks. Sync Obsidian.',
    stack: ['Claude Code', 'MCP', 'WSL', 'Bash'],
    color: '#4ADE80',
    nodeY: -11,
    angle: (Math.PI * 5) / 3,
    branchLen: 7,
  },
];
