"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { type Intermediate } from "@/lib/data";

interface Props {
  intermediate: Intermediate;
  onClose: () => void;
}

export function IntermediateModal({ intermediate, onClose }: Props) {
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
        className="modal-enter relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-panel border border-accent/30 clip-cut"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative bg-navy">
          <img
            src={`/nft/${intermediate.id}.jpg`}
            alt={intermediate.name}
            className="w-full h-auto block"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent" />

          <div className="absolute top-0 left-0 bg-navy/80 backdrop-blur-sm px-2.5 py-1.5 font-mono text-[10px] text-accent tracking-widest border-r border-b border-border">
            #{intermediate.id} ◈
          </div>

          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-navy/80 backdrop-blur-sm px-3 py-2 font-mono text-[11px] text-muted hover:text-text border-l border-b border-border transition-colors"
          >
            ESC
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="font-mono text-[9px] tracking-widest text-accent/70 uppercase mb-1">
              {intermediate.group} · Свидетель
            </div>
            <h2 className="font-sans font-bold text-xl text-text leading-tight">{intermediate.name}</h2>
            <p className="font-mono text-[10px] text-muted mt-0.5">{intermediate.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Quote */}
          <p className="font-mono text-[11px] text-muted italic mb-4 border-l-2 border-accent/30 pl-3 leading-relaxed">
            "{intermediate.quote}"
          </p>

          {/* Fate */}
          <div className="border border-border/50 bg-surface/50 clip-cut-sm px-4 py-3">
            <div className="font-mono text-[9px] tracking-widest text-accent uppercase mb-2">Судьба</div>
            <p className="text-[13px] text-text/80 leading-relaxed">{intermediate.fate}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
