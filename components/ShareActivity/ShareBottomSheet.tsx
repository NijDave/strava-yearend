"use client";

import { useEffect, useState } from "react";
import { OverlayVariant } from "./OverlayCard";
import { OverlayCarousel } from "./OverlayCarousel";
import { ActionButtons } from "./ActionButtons";
import { AppShareIcons } from "./AppShareIcons";
import { useOverlayActions } from "@/hooks/useOverlayActions";
import { ActivityData } from "@/types";

interface ShareBottomSheetProps {
  activity: ActivityData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareBottomSheet({ activity, isOpen, onClose }: ShareBottomSheetProps) {
  const [activeVariant, setActiveVariant] = useState<OverlayVariant>("transparent");
  const { state, copyToClipboard, saveAsImage, shareNative } = useOverlayActions();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleVariantChange = (variant: OverlayVariant) => {
    setActiveVariant(variant);
    // Note: We no longer need the ref because we're drawing from activity data!
  };

  const handleCopy = async () => {
    if (!activity) return;
    const success = await copyToClipboard(activity, activeVariant);
    if (success) showToast("Overlay copied! Paste into Story or Message 📋");
  };

  const handleSave = async () => {
    if (!activity) return;
    await saveAsImage(activity, activeVariant);
    // Hook handles download
  };

  const handleCopyLink = async () => {
    if (!activity) return;
    const url = `https://www.strava.com/activities/${activity.stravaId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Strava link copied! 🔗");
    } catch {
      showToast("Failed to copy link");
    }
  };

  const handleMore = async () => {
    if (!activity) return;
    await shareNative(activity, activeVariant);
  };

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!activity) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-[480px] z-[51] bg-[#1a1a1a] rounded-t-[24px] border-t border-white/10 transition-transform duration-500 ease-out transform ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="font-bebas text-2xl text-white tracking-widest text-center">Share Activity</h2>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest text-center mt-1">
            Pick a style and share your progress
          </p>
        </div>

        {/* Carousel */}
        <div className="bg-black/20 py-2">
           <OverlayCarousel activity={activity} onVariantChange={handleVariantChange} />
        </div>

        {/* Share to icons */}
        <div className="py-6 pt-2">
          <AppShareIcons onShare={handleMore} />
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8">
           <ActionButtons 
              state={state}
              onCopyPath={handleCopy}
              onSave={handleSave}
              onCopyLink={handleCopyLink}
              onMore={handleMore}
           />
        </div>

        {/* Cancel */}
        <button 
          onClick={onClose}
          className="w-full py-4 font-mono text-xs uppercase tracking-[0.2em] text-white/30 border-t border-white/5 bg-white/[0.02]"
        >
          Cancel
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-neon-orange text-black font-mono text-xs px-6 py-3 uppercase tracking-widest shadow-[0_0_30px_rgba(255,85,0,0.4)] animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}
    </>
  );
}
