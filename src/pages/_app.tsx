import type { AppProps } from "next/app";
import { TerminalUIProvider } from "@/contexts/TerminalUIContext";
import "@/app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TerminalUIProvider>
      <Component {...pageProps} />
    </TerminalUIProvider>
  );
}
