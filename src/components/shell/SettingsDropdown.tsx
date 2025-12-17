import React from "react";
import { useRouter } from "next/navigation";

export function SettingsDropdown({
  open,
  onClose,
  staffMode,
  setStaffMode,
}: {
  open: boolean;
  onClose: () => void;
  staffMode: boolean;
  setStaffMode: (v: boolean) => void;
}) {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black overflow-hidden z-60">
      <div className="px-4 py-3 text-xs text-slate-400 uppercase">Account</div>

      <button
        className="w-full text-left px-4 py-3 text-slate-100 hover:bg-slate-800/60
          focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        onClick={() => {
          onClose();
          router.push("/settings");
        }}
      >
        Settings
      </button>

      <div className="px-4 py-2 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-200 font-semibold">Staff Mode</div>
          <button
            onClick={() => setStaffMode(!staffMode)}
            className={`min-h-[40px] px-3 rounded-full border text-xs font-bold
              ${staffMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-950 border-slate-700 text-slate-300"}
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900`}
            aria-label="Toggle Staff Mode"
          >
            {staffMode ? "ON" : "OFF"}
          </button>
        </div>
        <div className="text-xs text-slate-400 mt-1">Role switching lives here to prevent accidental toggles.</div>
      </div>

      <button
        className="w-full text-left px-4 py-3 text-slate-100 hover:bg-slate-800/60 border-t border-slate-700
          focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        onClick={() => {
          onClose();
          alert("Logout (wire later)");
        }}
      >
        Logout
      </button>
    </div>
  );
}
