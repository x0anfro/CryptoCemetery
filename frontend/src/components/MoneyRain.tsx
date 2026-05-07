"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  rotSpeed: number;
  speed: number;
  opacity: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  type: "bill" | "coin";
  hue: number;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

const BILL_PALETTES = [
  { fill: "#1e4d1e", stroke: "#2d6e2d", text: "#3d8e3d" },
  { fill: "#1a3a52", stroke: "#1e4a6a", text: "#2a6090" },
  { fill: "#4a3820", stroke: "#6a5030", text: "#8a7050" },
];

function makeBill(canvasW: number): Particle {
  const isCoin = Math.random() < 0.18;
  const w = isCoin ? 14 + Math.random() * 8 : 30 + Math.random() * 24;
  const h = isCoin ? w : w * 0.44;
  return {
    x: Math.random() * canvasW,
    y: -(h + Math.random() * 200),
    w, h,
    rot: (Math.random() - 0.5) * 0.6,
    rotSpeed: (Math.random() - 0.5) * 0.004,
    speed: 0.1 + Math.random() * 0.2,
    opacity: 0.12 + Math.random() * 0.12,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.008 + Math.random() * 0.012,
    wobbleAmp: 0.3 + Math.random() * 0.5,
    type: isCoin ? "coin" : "bill",
    hue: Math.floor(Math.random() * BILL_PALETTES.length),
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, t: number) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot + Math.sin(t * p.wobbleSpeed + p.wobblePhase) * 0.12);

  if (p.type === "coin") {
    const r = p.w / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#7a4000";
    ctx.fill();
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    grad.addColorStop(0, "#f09a2050");
    grad.addColorStop(1, "#00000000");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#e8830a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    ctx.strokeStyle = "#f09a2060";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "#f5a623cc";
    ctx.font = `bold ${r * 1.1}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", 0, 0.5);
  } else {
    const pal = BILL_PALETTES[p.hue];
    const hw = p.w / 2, hh = p.h / 2;
    ctx.fillStyle = pal.fill;
    ctx.fillRect(-hw, -hh, p.w, p.h);
    ctx.strokeStyle = pal.stroke;
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-hw + 2, -hh + 1.5, p.w - 4, p.h - 3);
    ctx.beginPath();
    ctx.ellipse(-hw * 0.5, 0, p.w * 0.09, p.h * 0.28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = pal.text;
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(hw * 0.5, 0, p.w * 0.09, p.h * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pal.text + "aa";
    ctx.font = `bold ${p.h * 0.48}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("100", 0, 0.5);
    ctx.strokeStyle = pal.stroke + "80";
    ctx.lineWidth = 0.3;
    [-hh * 0.45, hh * 0.45].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(-hw + 5, y);
      ctx.lineTo(hw - 5, y);
      ctx.stroke();
    });
  }

  ctx.restore();
}

function spawnDust(dust: Dust[], p: Particle) {
  const color = p.type === "coin" ? "#f5a623" : BILL_PALETTES[p.hue].text;
  const count = 12 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 1.2 + Math.random() * 2.8;
    dust.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.8,
      life: 1,
      size: 1 + Math.random() * 2.5,
      color,
    });
  }
}

const COUNT = 45;

export function MoneyRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const dustRef = useRef<Dust[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: COUNT }, () => {
      const p = makeBill(canvas.width);
      p.y = Math.random() * canvas.height;
      return p;
    });

    function handleClick(e: MouseEvent) {
      const particles = particlesRef.current;
      const rect = canvas!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const hitR = Math.max(p.w, p.h) / 2 * 1.4;
        const dx = cx - p.x;
        const dy = cy - p.y;
        if (dx * dx + dy * dy < hitR * hitR) {
          spawnDust(dustRef.current, p);
          particles[i] = makeBill(canvas!.width);
          break;
        }
      }
    }
    window.addEventListener("click", handleClick);

    function tick() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t++;

      // particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speed;
        p.rot += p.rotSpeed;
        p.x += Math.sin(t * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmp;
        if (p.y > canvas.height + 60) particles[i] = makeBill(canvas.width);
        drawParticle(ctx, p, t);
      }

      // dust
      const dust = dustRef.current;
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.06;
        d.vx *= 0.96;
        d.life -= 0.032;
        if (d.life <= 0) { dust.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = d.life * 0.85;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
}
