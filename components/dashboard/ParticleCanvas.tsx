"use client";

import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  opacityDelta: number;
}

/**
 * ParticleCanvas — canvas-based particle field of drifting orange embers.
 * Auto-adjusts particle count for mobile (30-40) vs desktop (80-100).
 */
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const PARTICLE_COUNT = isMobile ? 35 : 90;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * (canvas?.width || window.innerWidth),
      y: Math.random() * (canvas?.height || window.innerHeight),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.05,
      opacityDelta: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
    });

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opacityDelta;
        if (p.opacity > 0.35 || p.opacity < 0.03) p.opacityDelta *= -1;

        // Wrap around
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        // Draw ember dot
        const colorRand = i % 5;
        let color: string;
        if (colorRand < 2) color = `rgba(255, 85, 0, ${p.opacity})`; // orange
        else if (colorRand < 4) color = `rgba(233, 30, 140, ${p.opacity * 0.7})`; // magenta
        else color = `rgba(139, 47, 201, ${p.opacity * 0.6})`; // purple

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", resize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
