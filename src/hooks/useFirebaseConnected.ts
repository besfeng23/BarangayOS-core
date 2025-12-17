import { useEffect, useState } from "react";

// Best-practice is RTDB ".info/connected". This is implemented via a dynamic import
// so builds won't crash if RTDB isn't installed yet.
// If RTDB is unavailable, we gracefully fall back to `true` (so navigator.onLine drives Offline Mode).
export function useFirebaseConnected() {
  const [connected, setConnected] = useState<boolean>(true);

  useEffect(() => {
    let unsub: null | (() => void) = null;
    let mounted = true;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbMod: any = await import("firebase/database");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const appMod: any = await import("firebase/app");

        // If your project already exports a firebaseApp, prefer importing it.
        // Otherwise, initialize elsewhere. Here we assume app is already initialized by the host app.
        const app = appMod.getApp ? appMod.getApp() : null;
        if (!app) return;

        const db = dbMod.getDatabase(app);
        const infoRef = dbMod.ref(db, ".info/connected");

        const off = dbMod.onValue(infoRef, (snap: any) => {
          if (!mounted) return;
          setConnected(!!snap.val());
        });

        unsub = () => off();
      } catch {
        // RTDB not installed or not configured: keep connected=true
        if (mounted) setConnected(true);
      }
    })();

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  return connected;
}
