'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { PROJECTS } from '@/data/projects';

export default function ProjectOverlay() {
  const activeProject = useStore((s) => s.activeProject);
  const isInsideProject = useStore((s) => s.isInsideProject);
  const exitProject = useStore((s) => s.exitProject);

  useEffect(() => {
    if (!isInsideProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitProject();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isInsideProject, exitProject]);

  if (!activeProject || !isInsideProject) return null;
  const project = PROJECTS.find((p) => p.id === activeProject);
  if (!project) return null;

  return (
    <div className="project-overlay">
      <div className="project-content">
        <div className="project-meta" style={{ color: project.color }}>
          {project.id.toUpperCase()}
        </div>
        <h2 className="project-name">{project.name}</h2>
        <p className="project-tagline">{project.tagline}</p>
        <p className="project-description">{project.description}</p>

        <div className="project-stack">
          {project.stack.map((s) => (
            <span key={s} className="stack-pill" style={{ borderColor: `${project.color}55` }}>
              {s}
            </span>
          ))}
        </div>

        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="project-url"
            style={{ color: project.color, borderColor: `${project.color}88` }}
          >
            {project.url.replace(/^https?:\/\//, '')} ↗
          </a>
        )}

        <button className="project-close" onClick={exitProject} aria-label="Close project">
          ESC · close
        </button>
      </div>
    </div>
  );
}
