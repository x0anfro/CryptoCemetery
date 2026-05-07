"use client";

import { useRef, useEffect, useState } from "react";
import { type Tombstone } from "@/lib/data";
import { TombstoneCard } from "./TombstoneCard";

const STACK: string[] = [
  "translateX(60px) rotate(6deg) scale(0.84)",
  "scale(0.91)",
  "translateX(-60px) rotate(-6deg) scale(0.84)",
  "translateX(40px) rotate(-4deg) scale(0.87)",
];

interface Props {
  stones: Tombstone[];
  balances: Record<number, number>;
}

export function ScrollRevealGroup({ stones, balances }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setRevealed(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`grid gap-4 ${
      stones.length === 4
        ? "grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    }`}>
      {stones.map((t, i) => (
        <div
          key={t.id}
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "none" : (STACK[i] ?? "scale(0.9)"),
            transition: `opacity 0.55s ease ${i * 100}ms, transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1) ${i * 100}ms`,
          }}
        >
          <TombstoneCard tombstone={t} owned={balances[t.id] ?? 0} />
        </div>
      ))}
    </div>
  );
}
