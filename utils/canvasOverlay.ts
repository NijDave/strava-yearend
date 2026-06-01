"use client";

import { getOverlayStats } from "./formatActivityOverlay";

export type OverlayVariant = "transparent" | "dark" | "neon" | "light" | "stats-only";

interface DrawOptions {
  width: number;
  height: number;
  scale: number;
}

export async function generateOverlayCanvas(
  activity: any,
  variant: OverlayVariant,
  options: DrawOptions = { width: 390, height: 640, scale: 3 }
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
  
  // 2. Background
  if (variant === "transparent" || variant === "stats-only") {
    ctx.clearRect(0, 0, width, height); // Fully transparent
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

  // 3. Stats — vertically centered in top portion
  const stats = getOverlayStats(activity);
  let y = 130;
  
  stats.forEach(({ label, value }) => {
    // Label
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.65;
    ctx.font = '500 13px "Space Mono", monospace';
    ctx.textAlign = "center";
    (ctx as any).letterSpacing = "2px";
    ctx.fillText(label.toUpperCase(), centerX, y);
    
    y += 8;
    
    // Value
    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 58px "Bebas Neue", sans-serif';
    (ctx as any).letterSpacing = "0px";
    ctx.fillText(value, centerX, y + 50);
    
    y += 110;
  });

  // 4. Route Map — only on non-stats-only variants
  if (variant !== "stats-only") {
    const polylineStr = activity.rawData?.map?.summary_polyline || activity.map?.summary_polyline;
    if (polylineStr) {
      await drawRoute(ctx, polylineStr, variant);
    } else {
      // ✕ cross for no-GPS activities
      ctx.strokeStyle = "#FF5500";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(centerX - 20, 470); ctx.lineTo(centerX + 20, 510);
      ctx.moveTo(centerX + 20, 470); ctx.lineTo(centerX - 20, 510);
      ctx.stroke();
    }
  }

  // 5. Branding — always at bottom, safely below map
  await new Promise<void>((resolve) => {
    const logoImg = new Image();
    logoImg.src = "/logo.png";
    logoImg.onload = () => {
      ctx.globalAlpha = 0.85;
      const targetHeight = 22;
      const targetWidth = (targetHeight / logoImg.height) * logoImg.width;
      ctx.drawImage(logoImg, centerX - targetWidth / 2, 608, targetWidth, targetHeight);
      ctx.globalAlpha = 1.0;
      resolve();
    };
    logoImg.onerror = () => {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = '14px "Space Mono", monospace';
      (ctx as any).letterSpacing = "4px";
      ctx.textAlign = "center";
      ctx.fillText("ATHLYTIC", centerX, 618);
      ctx.globalAlpha = 1.0;
      resolve();
    };
  });

  return canvas;
}

async function drawRoute(ctx: CanvasRenderingContext2D, polylineStr: string, variant: string) {
  const polylineModule = await import("@mapbox/polyline") as any;
  const polyline = polylineModule.default || polylineModule;
  const coords = polyline.decode(polylineStr) as [number, number][];
  if (!coords.length) return;

  const lats = coords.map((c: [number, number]) => c[0]);
  const lngs = coords.map((c: [number, number]) => c[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  // Map box: starts at y=415, height=170 → ends at y=585 (well above logo at 608)
  const boxX = 35, boxY = 415, boxW = 320, boxH = 170, pad = 18;
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
