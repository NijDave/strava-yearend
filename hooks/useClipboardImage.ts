import { useState } from "react";

export type OverlayState = "idle" | "generating" | "success" | "error";

export function useClipboardImage() {
  const [state, setState] = useState<OverlayState>("idle");

  const copyElementToClipboard = async (element: HTMLElement, filename: string) => {
    setState("generating");

    // ── Step 1: Bring element into viewport temporarily ──────────────────
    // html2canvas cannot capture elements outside the visible viewport.
    // We move it to top-left with opacity:0 so the user can't see it,
    // capture, then restore the original styles.
    const originalStyle = element.getAttribute("style") ?? "";
    element.style.setProperty("position", "fixed", "important");
    element.style.setProperty("left", "0px", "important");
    element.style.setProperty("top", "0px", "important");
    element.style.setProperty("opacity", "0", "important");
    element.style.setProperty("pointer-events", "none", "important");
    element.style.setProperty("z-index", "-1", "important");

    try {
      // ── Step 2: Wait for fonts to load ─────────────────────────────────
      await document.fonts.ready;
      // Extra tick to let the browser paint the element
      await new Promise(r => setTimeout(r, 120));

      // ── Step 3: Capture with html2canvas ───────────────────────────────
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(element, {
        backgroundColor: null, // CRITICAL — transparent PNG
        scale: 2,              // retina quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: element.offsetWidth || 400,
        height: element.offsetHeight || 600,
        windowWidth: element.offsetWidth || 400,
        windowHeight: element.offsetHeight || 600,
      });

      // ── Step 4: Restore element to off-screen ─────────────────────────
      element.setAttribute("style", originalStyle);

      // Sanity check — if canvas is blank, something went wrong
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("html2canvas returned a zero-size canvas");
      }

      // ── Step 5: Write to clipboard or download ─────────────────────────
      const isClipboardSupported =
        typeof ClipboardItem !== "undefined" &&
        typeof navigator.clipboard?.write === "function";

      if (isClipboardSupported) {
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            if (!blob) { reject(new Error("Canvas toBlob returned null")); return; }
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
              resolve();
            } catch (clipErr) {
              // Clipboard write can fail if the page lost focus — fallback to download
              console.warn("Clipboard write failed, downloading instead:", clipErr);
              const link = document.createElement("a");
              link.download = `${filename}-overlay.png`;
              link.href = canvas.toDataURL("image/png");
              link.click();
              resolve(); // Still resolve — download is a success path
            }
          }, "image/png");
        });

        setState("success");
        setTimeout(() => setState("idle"), 2500);
        return { success: true, method: "clipboard" as const };
      } else {
        // Fallback for Firefox / older iOS — download as PNG
        const link = document.createElement("a");
        link.download = `${filename}-overlay.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        setState("success");
        setTimeout(() => setState("idle"), 2500);
        return { success: true, method: "download" as const };
      }
    } catch (err) {
      // ── Restore element even on error ──────────────────────────────────
      element.setAttribute("style", originalStyle);
      console.error("[useClipboardImage] Capture failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
      return { success: false, method: "error" as const };
    }
  };

  return { state, copyElementToClipboard };
}
