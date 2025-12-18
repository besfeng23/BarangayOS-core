import { useEffect, useState } from "react";
export function useIsDesktop(minWidthPx = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    onChange(); mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [minWidthPx]);
  return isDesktop;
}
