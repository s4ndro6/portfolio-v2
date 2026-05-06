export interface Project {
  id: string;
  index: number;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  url?: string;
  color: string;
  shaderType: 'waves' | 'matrix' | 'wireframe' | 'embers' | 'orbs' | 'crt';
}

export const PROJECTS: Project[] = [
  {
    id: 'fluvo',
    index: 0,
    name: 'Fluvo',
    tagline: "L'agence qui se gère elle-même.",
    description:
      'SaaS 360° — CRM, outbound auto, portail client, Stripe, 3 agents IA. 201 endpoints en prod.',
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Stripe'],
    url: 'https://fluvo.app',
    color: '#5B8DEE',
    shaderType: 'waves',
  },
  {
    id: 'hunt',
    index: 1,
    name: 'Alternance Hunt',
    tagline: '330+ candidatures sans bouger.',
    description:
      'Pipeline n8n autonome. 6 sources, scoring Groq, envoi Gmail + LBA.',
    stack: ['n8n', 'Groq', 'Next.js', 'Gmail API'],
    color: '#34D399',
    shaderType: 'matrix',
  },
  {
    id: 'nexus',
    index: 2,
    name: 'NEXUS Agent',
    tagline: 'Agent IA local qui voit tout.',
    description:
      'LangGraph 7 nœuds, browser-use CDP, Ollama vision, Qdrant.',
    stack: ['LangGraph', 'FastAPI', 'Ollama', 'Qdrant'],
    color: '#22D3EE',
    shaderType: 'wireframe',
  },
  {
    id: 'arcane',
    index: 3,
    name: 'Arcane Fury',
    tagline: 'Combat VR physique.',
    description:
      'Unity 6.4, Meta Quest 3S, ragdoll, 3 écoles de magie.',
    stack: ['Unity 6.4', 'C#', 'Meta Quest 3S'],
    color: '#FF6B35',
    shaderType: 'embers',
  },
  {
    id: 'agents',
    index: 4,
    name: 'Léa · Hugo · Noam',
    tagline: 'Mon équipe IA dans Fluvo.',
    description:
      '3 agents spécialisés orchestrés LangGraph. En prod.',
    stack: ['LangGraph', 'Claude', 'Groq'],
    color: '#A78BFA',
    shaderType: 'orbs',
  },
  {
    id: 'jarvis',
    index: 5,
    name: 'Jarvis',
    tagline: 'Terminal augmenté.',
    description:
      'Claude Code WSL, 10 skills, 4 MCP, 3 hooks. Sync Obsidian.',
    stack: ['Claude Code', 'MCP', 'WSL', 'Bash'],
    color: '#4ADE80',
    shaderType: 'crt',
  },
];
