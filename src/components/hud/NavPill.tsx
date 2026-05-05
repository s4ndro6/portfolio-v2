"use client";

import { useAppStore } from "@/store/useAppStore";

/**
 * Glassmorphism pill — top-right.
 * 2 items: Sound toggle + Contact (scroll to bottom).
 */
export function NavPill() {
  const enabled = useAppStore((s) => s.audioEnabled);
  const toggle = useAppStore((s) => s.toggleAudio);

  const scrollToContact = () => {
    if (typeof window === "undefined") return;
    const max =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max, behavior: "smooth" });
  };

  return (
    <nav className="nav-pill" aria-label="Navigation principale">
      <button
        type="button"
        onClick={toggle}
        className="nav-pill__item"
        aria-pressed={enabled}
        aria-label={enabled ? "Désactiver l'audio" : "Activer l'audio"}
      >
        <span className="nav-pill__dot" data-on={enabled} />
        <span>{enabled ? "Sound · ON" : "Sound · OFF"}</span>
      </button>
      <span className="nav-pill__sep" />
      <button
        type="button"
        onClick={scrollToContact}
        className="nav-pill__item"
        aria-label="Aller au contact"
      >
        Contact ↗
      </button>
    </nav>
  );
}
