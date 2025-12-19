"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  html: string | null;                 // complete HTML document
  onAfterPrint?: () => void;
  onError?: (e: any) => void;
};

export default function PrintFrame({ html, onAfterPrint, onError }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!html) return;
    const iframe = ref.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(html);
      doc.close();

      // Give browser a tick to layout before printing
      const t = window.setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          onAfterPrint?.();
        } catch (e) {
          onError?.(e);
        }
      }, 250);

      return () => window.clearTimeout(t);
    } catch (e) {
      onError?.(e);
    }
  }, [html, onAfterPrint, onError]);

  return (
    <iframe
      ref={ref}
      title="print"
      style={{ position: "absolute", width: 0, height: 0, border: 0, opacity: 0, pointerEvents: "none" }}
    />
  );
}
