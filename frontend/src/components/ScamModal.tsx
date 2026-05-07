"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { type Tombstone, TOMBSTONE_DESCRIPTIONS } from "@/lib/data";

const CAUSE_COLORS: Record<string, string> = {
  Hack:          "text-red-400 border-red-900/60 bg-red-950/40",
  Ponzi:         "text-orange-400 border-orange-900/60 bg-orange-950/40",
  "Rug Pull":    "text-purple-400 border-purple-900/60 bg-purple-950/40",
  Mismanagement: "text-yellow-400 border-yellow-900/60 bg-yellow-950/40",
  Hubris:        "text-accent border-accent/30 bg-accent/5",
};

interface Props {
  tombstone: Tombstone;
  onClose: () => void;
}

export function ScamModal({ tombstone, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const causeClass = CAUSE_COLORS[tombstone.cause_of_death] ?? "text-muted border-border bg-surface";
  const description = TOMBSTONE_DESCRIPTIONS[tombstone.id];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-navy/95 backdrop-blur-md" />

      {/* panel */}
      <div
        className="modal-enter relative w-full max-w-5xl bg-panel border border-border/60 clip-cut overflow-hidden flex flex-col md:flex-row"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Left: large image ── */}
        <div className="relative md:w-[55%] md:flex-shrink-0 h-64 sm:h-80 md:h-auto bg-navy overflow-hidden">
          <img
            src={`/nft/${tombstone.id}.jpg`}
            alt={tombstone.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => { (e.target as HTMLImageElement).src = "/nft/placeholder.png"; }}
          />

          {/* right-edge fade into panel on desktop */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-panel/80" />
          {/* bottom-edge fade on mobile */}
          <div className="md:hidden absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-panel to-transparent" />

          {/* ID badge */}
          <div className="absolute top-0 left-0 bg-navy/80 backdrop-blur-sm px-2.5 py-1.5 font-mono text-[10px] text-muted tracking-widest border-r border-b border-border">
            #{String(tombstone.id).padStart(2, "0")}
          </div>
        </div>

        {/* ── Right: details ── */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

          {/* close */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-navy/80 backdrop-blur-sm px-3 py-2 font-mono text-[11px] text-muted hover:text-text border-l border-b border-border transition-colors z-10"
          >
            ESC
          </button>

          <div className="p-5 md:p-7 pt-10 md:pt-7 flex flex-col gap-4 flex-1">

            {/* title */}
            <div className="flex items-start gap-3 pr-12 md:pr-0">
              <h2 className="font-sans font-bold text-xl text-text leading-tight flex-1">
                {tombstone.name}
              </h2>
              <span className={`font-mono text-[8px] px-1.5 py-0.5 border tracking-wider shrink-0 uppercase ${causeClass}`}>
                {tombstone.cause_of_death}
              </span>
            </div>

            {/* meta */}
            <div className="font-mono text-[10px] text-accent/70">
              {(tombstone.founder || tombstone.villain) ? `${tombstone.founder ?? tombstone.villain} · ` : ""}{tombstone.born}–{tombstone.died}
            </div>

            {/* epitaph */}
            <p className="font-mono text-[11px] text-muted italic border-l-2 border-accent/30 pl-3 leading-relaxed">
              "{tombstone.epitaph}"
            </p>

            {/* description */}
            {description && (
              <p className="text-[13px] text-text/80 leading-relaxed">
                {description}
              </p>
            )}

            {/* stats */}
            <div className="mt-auto border-t border-border pt-4 grid grid-cols-2 gap-4">
              {[
                ...(tombstone.amount_lost ? [{ k: tombstone.amount_label ?? "Потери", v: tombstone.amount_lost, c: "text-red-400" }] : []),
                { k: "Группа", v: tombstone.group, c: "text-accent" },
              ].map(({ k, v, c }) => (
                <div key={k}>
                  <div className="font-mono text-[9px] text-muted/60 uppercase tracking-wider mb-0.5">{k}</div>
                  <div className={`font-mono text-sm font-bold ${c}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
