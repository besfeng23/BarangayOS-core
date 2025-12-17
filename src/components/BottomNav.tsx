import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboard spec: Home | History | Print | Settings
  const navItems = [
    { label: "Home", path: "/home", icon: "🏠" },
    { label: "History", path: "/history", icon: "🕘" },
    { label: "Print", path: "/print", icon: "🖨️" },
    { label: "Settings", path: "/settings", icon: "⚙️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around px-2 z-50 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={[
              "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
              isActive ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
            aria-label={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
