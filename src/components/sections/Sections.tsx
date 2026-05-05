"use client";

import { HubSection } from "@/components/sections/HubSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { useViewport } from "@/hooks/useViewport";
import { useAppStore } from "@/store/useAppStore";

/**
 * On desktop with full motion, the 3D scene IS the content — sections become
 * an invisible scroll spacer that sets the page length so the camera can
 * traverse the spinal axis as the user scrolls.
 *
 * On mobile or with prefers-reduced-motion, the canvas is heavy / disorienting,
 * so we fall back to the static HTML sections instead.
 */
export function Sections() {
  const { isMobile, isTouch } = useViewport();
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  const useFallback = isMobile || isTouch || reducedMotion;

  if (useFallback) {
    return (
      <main className="relative" style={{ zIndex: 10 }}>
        <HubSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    );
  }

  // Invisible scroll spacer — drives camera scroll progress through 5 vertebrae.
  // 5 × 200vh = 1000vh of scroll for the full axis traversal.
  return (
    <div
      aria-hidden="true"
      style={{ height: "1000vh", pointerEvents: "none" }}
    />
  );
}
