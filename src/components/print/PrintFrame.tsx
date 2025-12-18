import React, { useEffect, useRef } from "react";

type Props = {
  html: string; // full HTML document string
  onAfterPrint?: () => void;
  onError?: (e: Error) => void;
};

export function PrintFrame({ html, onAfterPrint, onError }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const w = iframe.contentWindow;
        if (!w) throw new Error("Print iframe has no contentWindow");
        w.focus();
        w.print();
        // best-effort callback
        setTimeout(() => onAfterPrint?.(), 300);
      } catch (e: any) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [html, onAfterPrint, onError]);

  return (
    <iframe
      ref={iframeRef}
      title="print"
      // Offscreen, not display:none (prevents blank print)
      style={{
        position: "fixed",
        right: 0,
        bottom: 0,
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        border: 0,
      }}
      srcDoc={html}
    />
  );
}
