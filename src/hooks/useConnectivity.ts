import { useEffect, useMemo, useState } from "react";

export type ConnectivityState = "ONLINE" | "OFFLINE";

export function useConnectivity() {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  const state: ConnectivityState = useMemo(() => (online ? "ONLINE" : "OFFLINE"), [online]);

  return { online, state };
}
