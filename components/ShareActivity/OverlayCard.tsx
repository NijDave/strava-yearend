"use client";

import { forwardRef } from "react";
import { getOverlayStats } from "@/utils/formatActivityOverlay";
import { polylineToSVG } from "@/utils/polylineToSVG";

export type OverlayVariant = "transparent" | "dark" | "neon" | "light";

interface OverlayCardProps {
  activity: any;
  variant: OverlayVariant;
}

const MONO = "'Space Mono', 'Courier New', Courier, monospace";
const HERO = "'Bebas Neue', Impact, 'Arial Narrow', sans-serif";

export const OverlayCard = forwardRef<HTMLDivElement, OverlayCardProps>(
  ({ activity, variant }, ref) => {
    const stats = getOverlayStats(activity);
    const polyline = activity.rawData?.map?.summary_polyline || activity.map?.summary_polyline;
    const svgData = polylineToSVG(polyline, 340, 180, 20);

    const getStyles = () => {
      switch (variant) {
        case "dark":
          return {
            bg: "rgba(0, 0, 0, 0.65)",
            text: "#FFFFFF",
            label: "rgba(255, 255, 255, 0.7)",
            route: "#FF5500",
            routeGlow: "rgba(255, 85, 0, 0.8)",
            badgeBorder: "white",
            border: "1px solid rgba(255,255,255,0.1)",
          };
        case "neon":
          return {
            bg: "#000000",
            text: "#FF5500",
            label: "rgba(255, 85, 0, 0.6)",
            route: "#FF5500",
            routeGlow: "rgba(255, 85, 0, 1)",
            badgeBorder: "#FF5500",
            border: "1px solid #FF5500",
          };
        case "light":
          return {
            bg: "rgba(255, 255, 255, 0.9)",
            text: "#000000",
            label: "rgba(0, 0, 0, 0.6)",
            route: "#FF5500",
            routeGlow: "rgba(255, 85, 0, 0.4)",
            badgeBorder: "black",
            border: "1px solid rgba(0,0,0,0.1)",
          };
        case "transparent":
        default:
          return {
            bg: "transparent",
            text: "#FFFFFF",
            label: "rgba(255, 255, 255, 0.75)",
            route: "#FF5500",
            routeGlow: "rgba(255, 85, 0, 0.9)",
            badgeBorder: "white",
            border: "none",
          };
      }
    };

    const s = getStyles();

    return (
      <div
        ref={ref}
        style={{
          width: 390,
          height: 580,
          background: s.bg,
          border: s.border,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 30px 30px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Transparent Badge */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            border: `1.5px solid ${s.badgeBorder}`,
            borderRadius: 4,
            padding: "4px 10px",
            color: s.text,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          {variant === "transparent" ? "TRANSPARENT" : variant.toUpperCase()}
        </div>

        {/* Stats Section */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: s.label,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: HERO,
                  fontSize: 52,
                  fontWeight: "bold",
                  color: s.text,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Route Map Section */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", flex: 1, minHeight: 180, alignItems: "center" }}>
          {svgData ? (
            <svg
              viewBox={svgData.viewBox}
              width={340}
              height={180}
              style={{ filter: `drop-shadow(0 0 6px ${s.routeGlow})` }}
            >
              <path
                d={svgData.d}
                fill="none"
                stroke={s.route}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, border: `2px solid ${s.route}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
                <span style={{ color: s.route, fontSize: 20 }}>✕</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: s.label, letterSpacing: 1 }}>NO GPS DATA</div>
            </div>
          )}
        </div>

        {/* Branding */}
        <div style={{ opacity: 0.8 }}>
          <img src="/logo.png" alt="Athlytic" style={{ height: 24, objectFit: "contain" }} />
        </div>
      </div>
    );
  }
);

OverlayCard.displayName = "OverlayCard";
