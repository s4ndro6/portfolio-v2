"use client";

import { HubSection } from "@/components/sections/HubSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactSection } from "@/components/sections/ContactSection";

/**
 * Stack of HTML overlays. Each section is 200vh, totaling 1000vh of scroll
 * for the camera to traverse z=18 → z=-180.
 */
export function Sections() {
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
