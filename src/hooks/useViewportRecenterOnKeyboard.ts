import { useEffect } from "react";
export function useViewportRecenterOnKeyboard(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const vv = window.visualViewport;
    const recenter = () => {
      const el = document.activeElement as HTMLElement;
      if (['input', 'textarea'].includes(el?.tagName?.toLowerCase())) {
        setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 80);
      }
    };
    window.addEventListener("focusin", recenter);
    vv?.addEventListener("resize", recenter);
    return () => { window.removeEventListener("focusin", recenter); vv?.removeEventListener("resize", recenter); };
  }, [enabled]);
}
