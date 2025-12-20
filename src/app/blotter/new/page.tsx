
"use client";
import { useBlotterWorkstation } from "@/hooks/blotter/useBlotterWorkstation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page is a now a client-side trigger to activate the 'form' mode
// in the main blotter workstation.
export default function Page() {
  const ws = useBlotterWorkstation();
  const router = useRouter();

  useEffect(() => {
    ws.newBlotter();
    router.replace('/blotter');
  }, [ws, router]);

  // Render nothing, or a loading state, while the redirect happens.
  return null;
}
