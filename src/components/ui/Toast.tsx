"use client";
import React, { useCallback, useEffect, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setMsg(message);
  }, []);

  const ToastComponent = () => {
    if (!msg) return null;
    return (
      <div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-100 px-6 py-3 rounded-full shadow-2xl shadow-black z-50
          ring-2 ring-zinc-500 ring-offset-2 ring-offset-zinc-950 animate-in fade-in slide-in-from-bottom-2"
        role="status"
        aria-live="polite"
      >
        {msg}
      </div>
    );
  };

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  return { showToast, ToastComponent };
}
