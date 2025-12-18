
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => "A", []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold
          focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black z-50 overflow-hidden"
          role="menu"
        >
          <button
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="w-full text-left px-4 py-3 hover:bg-zinc-800 min-h-[48px] text-zinc-100"
            role="menuitem"
          >
            Settings
            <div className="text-xs text-zinc-400">Barangay info • Trial</div>
          </button>

          <div className="px-4 py-2 text-xs text-zinc-500 border-t border-zinc-800">
            Role Switch (moved here)
          </div>

          <button
            onClick={() => {
              // placeholder; wire real role logic later
              setOpen(false);
              alert("Role switching will be wired to RBAC later.");
            }}
            className="w-full text-left px-4 py-3 hover:bg-zinc-800 min-h-[48px] text-zinc-100"
            role="menuitem"
          >
            Toggle Staff/Admin
          </button>

          <div className="border-t border-zinc-800" />

          <button
            onClick={() => {
              setOpen(false);
              alert("Logout hook here.");
            }}
            className="w-full text-left px-4 py-3 hover:bg-zinc-800 min-h-[48px] text-zinc-100"
            role="menuitem"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
