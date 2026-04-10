import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Cyberpunk palette
        "neon-orange": "#FF5500",
        "neon-magenta": "#E91E8C",
        "neon-purple": "#8B2FC9",
        "neon-cyan": "#00F5FF",
        "neon-lime": "#AAFF00",
        "cyber-black": "#000000",
        "cyber-dark": "#0a0a0a",
        "cyber-card": "#0d0d0d",
        "cyber-card2": "#111111",
        "red-alert": "#FF1744",
      },
      fontFamily: {
        bebas: ["'Bebas Neue'", "Impact", "sans-serif"],
        mono: ["'Space Mono'", "'Courier New'", "monospace"],
      },
      animation: {
        "neon-pulse": "neonPulse 2.5s ease-in-out infinite",
        "neon-text": "neonTextPulse 2.5s ease-in-out infinite",
        "glitch": "glitch 4s linear infinite",
        "flame": "flameDance 0.8s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out both",
        "slide-up-fast": "slideUpFast 0.3s ease-out both",
        "float": "float 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out both",
        "bar-rise": "barRise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "fill-width": "fillWidth 1s ease-out both",
        "pulse-ring": "pulseRing 1.5s ease-out infinite",
        "alert-flicker": "alertFlicker 2s ease-in-out infinite",
        "shake": "shake 0.3s ease",
        "scan-sweep": "scanSweep 3s linear infinite",
      },
      keyframes: {
        neonPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(255,85,0,0.4), 0 0 16px rgba(255,85,0,0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(255,85,0,0.8), 0 0 40px rgba(255,85,0,0.4)" },
        },
        neonTextPulse: {
          "0%, 100%": { textShadow: "0 0 8px rgba(255,85,0,0.5)" },
          "50%": { textShadow: "0 0 20px rgba(255,85,0,1), 0 0 40px rgba(255,85,0,0.5)" },
        },
        glitch: {
          "0%, 90%, 100%": { transform: "translate(0)", filter: "none" },
          "92%": { transform: "translate(-3px, 1px)", filter: "hue-rotate(90deg)" },
          "94%": { transform: "translate(3px, -1px)", filter: "hue-rotate(-90deg)" },
          "96%": { transform: "translate(-2px, 2px)", filter: "none" },
          "98%": { transform: "translate(2px, -2px)", filter: "hue-rotate(45deg)" },
        },
        flameDance: {
          "0%, 100%": { transform: "scaleY(1) rotate(-2deg)" },
          "25%": { transform: "scaleY(1.15) rotate(2deg) scaleX(0.9)" },
          "50%": { transform: "scaleY(0.9) rotate(-1deg) scaleX(1.1)" },
          "75%": { transform: "scaleY(1.1) rotate(3deg) scaleX(0.95)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-3px)" },
          "40%": { transform: "translateX(3px)" },
          "60%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUpFast: {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        barRise: {
          "0%": { transform: "scaleY(0)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(1)", transformOrigin: "bottom" },
        },
        fillWidth: {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width, 100%)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        alertFlicker: {
          "0%, 90%, 100%": { borderColor: "#FF1744", boxShadow: "0 0 10px rgba(255,23,68,0.4)" },
          "95%": { borderColor: "#FF5500", boxShadow: "0 0 20px rgba(255,85,0,0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scanSweep: {
          "0%": { top: "-5%" },
          "100%": { top: "105%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "neon-orange": "0 0 20px rgba(255,85,0,0.5), 0 0 40px rgba(255,85,0,0.2)",
        "neon-magenta": "0 0 20px rgba(233,30,140,0.5), 0 0 40px rgba(233,30,140,0.2)",
        "neon-purple": "0 0 20px rgba(139,47,201,0.5)",
        "neon-cyan": "0 0 20px rgba(0,245,255,0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
