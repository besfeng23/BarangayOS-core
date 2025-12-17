import * as React from "react";

type TerminalUIState = {
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
};

const TerminalUIContext = React.createContext<TerminalUIState | null>(null);

export function TerminalUIProvider({ children }: { children: React.ReactNode }) {
  const [globalSearch, setGlobalSearch] = React.useState("");

  return (
    <TerminalUIContext.Provider value={{ globalSearch, setGlobalSearch }}>
      {children}
    </TerminalUIContext.Provider>
  );
}

export function useTerminalUI() {
  const ctx = React.useContext(TerminalUIContext);
  if (!ctx) throw new Error("useTerminalUI must be used inside <TerminalUIProvider />");
  return ctx;
}
