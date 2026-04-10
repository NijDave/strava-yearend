"use client";

import { getOverlayStats } from "./formatActivityOverlay";

export type OverlayVariant = "transparent" | "dark" | "neon" | "light";

interface DrawOptions {
  width: number;
  height: number;
  scale: number;
}

export async function generateOverlayCanvas(
  activity: any,
  variant: OverlayVariant,
  options: DrawOptions = { width: 390, height: 580, scale: 3 }
): Promise<HTMLCanvasElement> {
  const { width, height, scale } = options;
  
  // 1. Ensure fonts are loaded before drawing
  try {
    await Promise.all([
      document.fonts.load('bold 58px "Bebas Neue"'),
      document.fonts.load('500 13px "Space Mono"'),
      document.fonts.load('14px "Space Mono"'),
    ]);
  } catch (err) {
    console.warn("Font loading failed, falling back to system fonts", err);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  
  // 2. Clear / Background
  if (variant === "transparent") {
    ctx.clearRect(0, 0, width, height); // Pure alpha = 0
  } else if (variant === "dark") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, width, height);
  } else if (variant === "neon") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  } else if (variant === "light") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 0, width, height);
  }

  const textColor = variant === "light" ? "#000000" : "#FFFFFF";
  const centerX = width / 2;

  // FIX 1 — REMOVED BADGE DRAWING BLOCK

  // 4. Stats (FIX 3 — NEW Y-SPACING)
  const stats = getOverlayStats(activity);
  let y = 130; // Start lower
  
  stats.forEach(({ label, value }) => {
    // Label
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.65;
    ctx.font = '500 13px "Space Mono", monospace';
    ctx.textAlign = "center";
    (ctx as any).letterSpacing = "2px";
    ctx.fillText(label.toUpperCase(), centerX, y);
    
    y += 8; // Small gap between label and value
    
    // Value
    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 58px "Bebas Neue", sans-serif';
    (ctx as any).letterSpacing = "0px";
    ctx.fillText(value, centerX, y + 50);
    
    y += 110; // Large gap before next stat block
  });

  // 5. Route Map (Async Drawing)
  const polylineStr = activity.rawData?.map?.summary_polyline || activity.map?.summary_polyline;
  if (polylineStr) {
    await drawRoute(ctx, polylineStr, variant);
  } else {
    // ✕ cross for no-GPS
    ctx.strokeStyle = "#FF5500";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(centerX - 20, 420); ctx.lineTo(centerX + 20, 460);
    ctx.moveTo(centerX + 20, 420); ctx.lineTo(centerX - 20, 460);
    ctx.stroke();
  }

  // 6. Branding
  await new Promise<void>((resolve) => {
    const logoImg = new Image();
    logoImg.src = "/logo.png";
    logoImg.onload = () => {
      ctx.globalAlpha = 0.8;
      const targetHeight = 24;
      const targetWidth = (targetHeight / logoImg.height) * logoImg.width;
      ctx.drawImage(logoImg, centerX - targetWidth / 2, 540, targetWidth, targetHeight);
      ctx.globalAlpha = 1.0;
      resolve();
    };
    logoImg.onerror = () => {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = '14px "Space Mono", monospace';
      (ctx as any).letterSpacing = "4px";
      ctx.textAlign = "center";
      ctx.fillText("ATHLYTIC", centerX, 555);
      ctx.globalAlpha = 1.0;
      resolve();
    };
  });

  return canvas;
}

async function drawRoute(ctx: CanvasRenderingContext2D, polylineStr: string, variant: string) {
  // Await the polyline library properly
  const polylineModule = await import("@mapbox/polyline") as any;
  const polyline = polylineModule.default || polylineModule;
  const coords = polyline.decode(polylineStr) as [number, number][];
  if (!coords.length) return;

  const lats = coords.map((c: [number, number]) => c[0]);
  const lngs = coords.map((c: [number, number]) => c[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const boxX = 45, boxY = 360, boxW = 300, boxH = 160, pad = 20;
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  
  const scaleX = (boxW - pad * 2) / lngRange;
  const scaleY = (boxH - pad * 2) / latRange;
  const scale = Math.min(scaleX, scaleY);
  
  const offsetX = boxX + pad + (boxW - pad * 2 - lngRange * scale) / 2;
  const offsetY = boxY + pad + (boxH - pad * 2 - latRange * scale) / 2;

  ctx.save();
  
  // Neon/Dark style glows
  if (variant !== "light") {
    ctx.shadowColor = "#FF5500";
    ctx.shadowBlur = variant === "neon" ? 20 : 12;
  }
  
  ctx.strokeStyle = "#FF5500";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  coords.forEach((c: [number, number], i: number) => {
    const x = offsetX + (c[1] - minLng) * scale;
    const y = offsetY + (maxLat - c[0]) * scale; // Flip Y
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}
