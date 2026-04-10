"use client";

import { CaptureState } from "@/hooks/useOverlayActions";

interface ActionButtonsProps {
  onCopyPath: () => void;
  onSave: () => void;
  onCopyLink: () => void;
  onMore: () => void;
  state: CaptureState;
}

export function ActionButtons({ onCopyPath, onSave, onCopyLink, onMore, state }: ActionButtonsProps) {
  const isCapturing = state === "capturing";

  const buttons = [
    { label: "Copy Image", icon: "⧉", action: onCopyPath },
    { label: "Save", icon: "↓", action: onSave },
    { label: "Copy Link", icon: "🔗", action: onCopyLink },
    { label: "More", icon: "↗", action: onMore },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-sm mx-auto">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          disabled={isCapturing}
          className="flex flex-col items-center gap-2 group transition-opacity disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl text-white group-active:scale-95 group-hover:bg-white/10 transition-all">
            {isCapturing && btn.label === "Copy Image" ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              btn.icon
            )}
          </div>
          <span className="font-mono text-[10px] text-white/50 uppercase tracking-tighter whitespace-nowrap">
            {btn.label}
          </span>
        </button>
      ))}
    </div>
  );
}
