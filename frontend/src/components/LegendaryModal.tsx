"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { type Legendary } from "@/lib/data";

interface Props {
  legendary: Legendary;
  onClose: () => void;
}

export function LegendaryModal({ legendary, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-navy/85 backdrop-blur-sm" />

      <div
        className="modal-enter relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-panel border border-accent/30 clip-cut"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative bg-navy">
          <img
            src={`/nft/${legendary.id}.jpg`}
            alt={legendary.name}
            className="w-full h-auto block"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent" />

          <div className="absolute top-0 left-0 bg-navy/80 backdrop-blur-sm px-2.5 py-1.5 font-mono text-[10px] text-accent tracking-widest border-r border-b border-border">
            #{legendary.id} ★
          </div>

          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-navy/80 backdrop-blur-sm px-3 py-2 font-mono text-[11px] text-muted hover:text-text border-l border-b border-border transition-colors"
          >
            ESC
          </button>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="font-mono text-[9px] tracking-widest text-accent/70 uppercase mb-1">
              {legendary.alias} · {legendary.group}
            </div>
            <h2 className="font-sans font-bold text-xl text-text leading-tight">{legendary.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Crime badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border border-red-900/60 bg-red-950/40 text-red-400">
              {legendary.crime}
            </span>
            <span className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border ${
              legendary.status === "At Large"
                ? "border-red-700 bg-red-950/40 text-red-400"
                : legendary.status === "Convicted" || legendary.status.startsWith("Convicted")
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-surface text-muted"
            }`}>
              {legendary.status}
            </span>
          </div>

          {/* Quote */}
          <p className="font-mono text-[11px] text-muted italic mb-4 border-l-2 border-accent/30 pl-3 leading-relaxed">
            "{legendary.quote}"
          </p>

          {/* Fate */}
          <div className="border border-border/50 bg-surface/50 clip-cut-sm px-4 py-3 mb-5">
            <div className="font-mono text-[9px] tracking-widest text-accent uppercase mb-2">Судьба</div>
            <p className="text-[13px] text-text/80 leading-relaxed">{legendary.fate}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
            {[
              { k: "Ущерб",    v: legendary.total_damage, c: "text-red-400"  },
              { k: "Жертвы",   v: legendary.victims,       c: "text-text"     },
              { k: "Приговор", v: legendary.sentence,      c: "text-accent"   },
            ].map(({ k, v, c }) => (
              <div key={k}>
                <div className="font-mono text-[9px] text-muted/60 uppercase tracking-wider mb-0.5">{k}</div>
                <div className={`font-mono text-xs font-bold ${c}`}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
