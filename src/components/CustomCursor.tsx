"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor — small dot + magnetic ring. Hidden on touch devices.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true);
      return;
    }

    const target = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      // Detect interactive cursor — element under pointer.
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const interactive =
        !!el?.closest("a, button, [role=button], input, textarea, [data-magnetic]");
      setIsPointer(interactive);
    };

    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          marginLeft: -2,
          marginTop: -2,
          borderRadius: "50%",
          background: "var(--amber)",
          pointerEvents: "none",
          zIndex: 90,
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ring}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isPointer ? 56 : 28,
          height: isPointer ? 56 : 28,
          marginLeft: isPointer ? -28 : -14,
          marginTop: isPointer ? -28 : -14,
          borderRadius: "50%",
          border: `1px solid ${isPointer ? "var(--amber)" : "rgba(232,236,240,0.4)"}`,
          pointerEvents: "none",
          zIndex: 90,
          transition: "width .25s ease, height .25s ease, margin .25s ease, border-color .25s ease",
        }}
      />
    </>
  );
}
