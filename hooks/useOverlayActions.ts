"use client";

import { useState } from "react";
import { generateOverlayCanvas, OverlayVariant } from "@/utils/canvasOverlay";

export type CaptureState = "idle" | "capturing" | "success" | "error";

export function useOverlayActions() {
  const [state, setState] = useState<CaptureState>("idle");

  const copyToClipboard = async (activity: any, variant: OverlayVariant) => {
    setState("capturing");
    
    try {
      // ── Modern Clipboard Promise Strategy ──
      // Some browsers (Safari) are very strict about the "user gesture".
      // We pass a Promise directly to ClipboardItem so the browser knows 
      // the intent started from the user's click.
      const isClipboardSupported =
        typeof ClipboardItem !== "undefined" &&
        typeof navigator.clipboard?.write === "function";

      if (isClipboardSupported) {
        const item = new ClipboardItem({
          "image/png": (async () => {
            const canvas = await generateOverlayCanvas(activity, variant);
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
            if (!blob) throw new Error("Canvas toBlob failed");
            return blob;
          })(),
        });

        await navigator.clipboard.write([item]);
        setState("success");
        setTimeout(() => setState("idle"), 2500);
        return true;
      } else {
        // Fallback for browsers without ClipboardItem (Firefox/Older iOS)
        const canvas = await generateOverlayCanvas(activity, variant);
        downloadCanvas(canvas, `athlytic-${activity.name.replace(/\s+/g, "_")}.png`);
        setState("success");
        setTimeout(() => setState("idle"), 2500);
        return true;
      }
    } catch (err) {
      console.error("Copy failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
      return false;
    }
  };

  const saveAsImage = async (activity: any, variant: OverlayVariant) => {
    setState("capturing");
    try {
      const canvas = await generateOverlayCanvas(activity, variant);
      downloadCanvas(canvas, `athlytic-${activity.name.replace(/\s+/g, "_")}.png`);
      setState("success");
      setTimeout(() => setState("idle"), 2500);
      return true;
    } catch (err) {
      console.error("Save failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
      return false;
    }
  };

  const shareNative = async (activity: any, variant: OverlayVariant) => {
    setState("capturing");
    try {
      const canvas = await generateOverlayCanvas(activity, variant);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Blob creation failed");

      const file = new File([blob], `${activity.name}.png`, { type: "image/png" });
      
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: activity.name,
        });
        setState("success");
        setTimeout(() => setState("idle"), 2500);
        return true;
      } else {
        downloadCanvas(canvas, `${activity.name}.png`);
        setState("success");
        setTimeout(() => setState("idle"), 2500);
        return true;
      }
    } catch (err) {
      console.error("Share failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
      return false;
    }
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return { state, copyToClipboard, saveAsImage, shareNative };
}
