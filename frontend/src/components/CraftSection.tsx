"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ABI, CONTRACT_ADDRESS, CRAFT_PRICE } from "@/lib/contract";
import { TOMBSTONES, LEGENDARIES, type Recipe } from "@/lib/data";
import { LegendaryModal } from "@/components/LegendaryModal";

interface Props {
  recipe: Recipe;
  balances: Record<number, number>;
  legendaryCrafted: boolean;
}

export function CraftSection({ recipe, balances, legendaryCrafted }: Props) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const legendary = LEGENDARIES.find((l) => l.id === recipe.legendary)!;
  const tombstones = recipe.tombstones.map((id) => TOMBSTONES.find((t) => t.id === id)!);
  const owned = recipe.tombstones.map((id) => (balances[id] ?? 0) > 0);
  const canCraft = owned.every(Boolean) && !legendaryCrafted;
  const ownedCount = owned.filter(Boolean).length;

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  function handleCraft() {
    const cb = { onSuccess: (hash: `0x${string}`) => setTxHash(hash) };
    if (recipe.craftFn === "craft") {
      writeContract(
        { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craft",
          args: [recipe.tombstones.map(BigInt) as [bigint, bigint, bigint]], value: CRAFT_PRICE },
        cb
      );
    } else {
      writeContract(
        { address: CONTRACT_ADDRESS, abi: ABI, functionName: recipe.craftFn,
          args: [], value: CRAFT_PRICE },
        cb
      );
    }
  }

  return (
    <>
      {modalOpen && <LegendaryModal legendary={legendary} onClose={() => setModalOpen(false)} />}

      <div
        className={`
          card-lift clip-cut border p-5 transition-all duration-300
          ${legendaryCrafted ? "border-border opacity-40"
            : canCraft        ? "border-accent/50 animate-glow"
            :                   "border-border hover:border-accent/20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[10px] tracking-widest text-accent uppercase">{recipe.group}</span>
          <div className="flex gap-1.5">
            {recipe.tombstones.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rotate-45 transition-colors ${owned[i] ? "bg-accent" : "bg-border"}`} />
            ))}
          </div>
        </div>

        {/* Slots */}
        <div className={`grid gap-2 mb-5 ${recipe.tombstones.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {tombstones.map((t, i) => (
            <div
              key={t.id}
              className={`p-3 text-center transition-all ${
                owned[i] ? "" : "opacity-40"
              }`}
            >
              <div className={`font-mono text-lg mb-1 ${owned[i] ? "text-accent" : "text-border"}`}>◈</div>
              <div className="font-sans text-[10px] text-text leading-tight">{t.name}</div>
              {owned[i] && <div className="font-mono text-[9px] text-accent mt-1">✓</div>}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-5" />

        {/* Legendary — always shows image + clickable for modal */}
        <button
          onClick={() => setModalOpen(true)}
          className={`w-full clip-cut border p-4 mb-4 transition-all text-left group ${
            legendaryCrafted ? "border-border opacity-40"
              : canCraft      ? "border-accent/40 hover:border-accent/70"
              :                 "border-border hover:border-accent/20"
          }`}
        >
          {/* Portrait */}
          <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-3 relative">
            <img
              src={`/nft/${legendary.id}.jpg`}
              alt={legendary.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
            <div className="absolute bottom-2 right-2 font-mono text-[8px] text-muted/60 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              подробнее →
            </div>
          </div>

          <div className={`font-mono text-2xl mb-2 text-center ${canCraft ? "text-accent" : "text-border"}`}>★</div>
          <div className="font-sans font-semibold text-sm text-text text-center mb-1">{legendary.name}</div>
          <div className="font-sans italic text-[11px] text-muted text-center leading-snug">"{legendary.quote}"</div>
          <div className="flex justify-center gap-4 mt-3">
            <span className="font-mono text-[10px] text-red-400">{legendary.total_damage}</span>
            <span className="text-border">·</span>
            <span className={`font-mono text-[10px] ${legendary.status === "At Large" ? "text-red-400" : "text-muted"}`}>
              {legendary.status}
            </span>
          </div>
        </button>

        {/* Button */}
        <button
          onClick={handleCraft}
          disabled={!canCraft || isBusy}
          className={`
            w-full py-3 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
            ${legendaryCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
              : canCraft        ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold"
              :                   "bg-surface text-muted/40 cursor-not-allowed border border-border"}
          `}
        >
          {legendaryCrafted ? "Already Crafted"
            : isSuccess      ? "★ Crafted"
            : isBusy         ? "Crafting…"
            : canCraft       ? "CRAFT"
            :                  `${ownedCount} / ${recipe.tombstones.length}`}
        </button>
      </div>
    </>
  );
}
